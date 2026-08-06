import { z } from "zod";
import { and, eq, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { stages, projects } from "../../drizzle/schema";
import { getDbOrThrow, logActivity, notifyProjectStakeholders, recalcProjectProgress, requireProjectAccess } from "./_shared";

const stageInput = z.object({
  projectId: z.number().int(),
  name: z.string().min(2),
  orderIndex: z.number().int().default(0),
  plannedStart: z.coerce.date().optional(),
  plannedEnd: z.coerce.date().optional(),
  dependsOnStageId: z.number().int().optional(),
});

const stageUpdateInput = z.object({
  id: z.number().int(),
  name: z.string().min(2).optional(),
  orderIndex: z.number().int().optional(),
  status: z.enum(["planned", "active", "done", "blocked"]).optional(),
  plannedStart: z.coerce.date().nullable().optional(),
  plannedEnd: z.coerce.date().nullable().optional(),
  actualStart: z.coerce.date().nullable().optional(),
  actualEnd: z.coerce.date().nullable().optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
});

const stageReviewInput = z.object({
  id: z.number().int(),
  decision: z.enum(["accepted", "rejected"]),
  comment: z.string().optional(),
});

export const stagesRouter = router({
  list: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(stages)
      .where(eq(stages.projectId, input.projectId))
      .orderBy(asc(stages.orderIndex), asc(stages.id));
    return rows;
  }),

  create: protectedProcedure.input(stageInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "admin");
    const result = await db.insert(stages).values({
      projectId: input.projectId,
      name: input.name,
      orderIndex: input.orderIndex,
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      dependsOnStageId: input.dependsOnStageId,
    });
    const stageId = Number(result[0]?.insertId);
    await recalcProjectProgress(db, input.projectId);
    await logActivity(db, input.projectId, ctx.user.id, "STAGE_CREATED", "stage", stageId, { name: input.name });
    return { id: stageId };
  }),

  update: protectedProcedure.input(stageUpdateInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [stage] = await db.select().from(stages).where(eq(stages.id, input.id)).limit(1);
    if (!stage) throw new TRPCError({ code: "NOT_FOUND", message: "Этап не найден" });
    await requireProjectAccess(db, ctx.user, stage.projectId, "foreman");

    const values: Partial<typeof stages.$inferInsert> = {};
    if (input.name !== undefined) values.name = input.name;
    if (input.orderIndex !== undefined) values.orderIndex = input.orderIndex;
    if (input.plannedStart !== undefined) values.plannedStart = input.plannedStart;
    if (input.plannedEnd !== undefined) values.plannedEnd = input.plannedEnd;
    if (input.actualStart !== undefined) values.actualStart = input.actualStart;
    if (input.actualEnd !== undefined) values.actualEnd = input.actualEnd;
    if (input.status !== undefined) {
      values.status = input.status;
      if (input.status === "active") values.actualStart = input.actualStart ?? new Date();
      if (input.status === "done") {
        values.actualEnd = input.actualEnd ?? new Date();
        values.progressPercent = 100;
        if (stage.reviewStatus === "rejected") {
          values.reviewStatus = "pending" as const;
          values.reviewComment = null;
          values.reviewedAt = null;
          values.reviewedBy = null;
        }
      }
    }
    if (input.progressPercent !== undefined) values.progressPercent = input.progressPercent;

    await db.update(stages).set(values).where(eq(stages.id, input.id));
    await recalcProjectProgress(db, stage.projectId);
    await logActivity(db, stage.projectId, ctx.user.id, "STAGE_UPDATED", "stage", input.id, values as Record<string, unknown>);
    return { success: true };
  }),

  delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [stage] = await db.select().from(stages).where(eq(stages.id, input.id)).limit(1);
    if (!stage) throw new TRPCError({ code: "NOT_FOUND", message: "Этап не найден" });
    await requireProjectAccess(db, ctx.user, stage.projectId, "admin");
    await db.delete(stages).where(eq(stages.id, input.id));
    await recalcProjectProgress(db, stage.projectId);
    await logActivity(db, stage.projectId, ctx.user.id, "STAGE_DELETED", "stage", input.id, { name: stage.name });
    return { success: true };
  }),

  review: protectedProcedure.input(stageReviewInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [stage] = await db.select().from(stages).where(eq(stages.id, input.id)).limit(1);
    if (!stage) throw new TRPCError({ code: "NOT_FOUND", message: "Этап не найден" });
    await requireProjectAccess(db, ctx.user, stage.projectId, "viewer");
    const [project] = await db
      .select({ customerId: projects.customerId })
      .from(projects)
      .where(eq(projects.id, stage.projectId))
      .limit(1);
    if (project?.customerId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Только заказчик может принимать этапы" });
    }

    const accepted = input.decision === "accepted";
    const values: Partial<typeof stages.$inferInsert> = {
      reviewStatus: input.decision,
      reviewComment: input.comment || null,
      reviewedAt: new Date(),
      reviewedBy: ctx.user.id,
      status: accepted ? "done" : "blocked",
      progressPercent: accepted ? 100 : 0,
    };
    await db.update(stages).set(values).where(eq(stages.id, input.id));
    await recalcProjectProgress(db, stage.projectId);
    await notifyProjectStakeholders(db, stage.projectId, ctx.user.id, {
      type: "stage_review",
      title: accepted ? "Этап принят" : "Этап не принят",
      body: `${stage.name}${input.comment ? ` — ${input.comment}` : ""}`,
    });
    await logActivity(db, stage.projectId, ctx.user.id, accepted ? "STAGE_ACCEPTED" : "STAGE_REJECTED", "stage", stage.id, { comment: input.comment });
    return { success: true };
  }),
});
