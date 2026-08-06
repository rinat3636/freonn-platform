import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDbOrThrow, requireProjectAccess } from "./_shared";
import { reports } from "../../drizzle/schema";
import { generateProjectReport } from "../jobs/reports";

export const reportsRouter = router({
  list: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    return db.select().from(reports).where(eq(reports.projectId, input.projectId)).orderBy(desc(reports.createdAt));
  }),

  generate: protectedProcedure
    .input(
      z.object({
        projectId: z.number().int(),
        type: z.enum(["weekly", "project_summary"]).default("project_summary"),
        periodStart: z.coerce.date().optional(),
        periodEnd: z.coerce.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
      const result = await generateProjectReport(
        input.projectId,
        input.type,
        input.periodStart,
        input.periodEnd,
        ctx.user.id
      );
      return result;
    }),

  delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [report] = await db.select().from(reports).where(eq(reports.id, input.id)).limit(1);
    if (!report) throw new Error("Report not found");
    await requireProjectAccess(db, ctx.user, report.projectId, "admin");
    await db.delete(reports).where(eq(reports.id, input.id));
    return { success: true };
  }),
});
