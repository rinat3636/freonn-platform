import { z } from "zod";
import { and, eq, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { stages } from "../../drizzle/schema";
import { getDbOrThrow, logActivity, recalcProjectProgress, requireProjectAccess } from "./_shared";

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
  plannedStart: z.coerce.date().optional(),
  plannedEnd: z.coerce.date().optional(),
  actualStart: z.coerce.date().optional(),
  actualEnd: z.coerce.date().optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
});

export const stagesRouter = router({
  list: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db.select().from(stages).where(eq(stages.projectId, input.projectId)).orderBy(asc(stages.orderIndex));
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

    const values: Partial<typeof input> = {};
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
});
