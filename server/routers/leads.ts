import { z } from "zod";
import { desc, eq, and, or, gte, lte, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDbOrThrow } from "./_shared";
import { leads } from "../../drizzle/schema";

const statusValues = ["new", "in_progress", "contract", "project", "cancelled"] as const;

export const leadsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(statusValues).optional(),
        search: z.string().optional(),
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      const conditions = [];
      if (input.status) conditions.push(eq(leads.status, input.status));
      if (input.from) conditions.push(gte(leads.createdAt, input.from));
      if (input.to) conditions.push(lte(leads.createdAt, input.to));
      if (input.search?.trim()) {
        const q = `%${input.search.trim()}%`;
        conditions.push(
          or(
            like(leads.name, q),
            like(leads.email, q),
            like(leads.phone, q),
            like(leads.message, q)
          )
        );
      }
      const where = conditions.length ? and(...conditions) : undefined;
      return db.select().from(leads).where(where).orderBy(desc(leads.createdAt));
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        status: z.enum(statusValues).optional(),
        assignedTo: z.number().int().nullable().optional(),
        notes: z.string().optional(),
        projectId: z.number().int().nullable().optional(),
        customerId: z.number().int().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      const [lead] = await db.select().from(leads).where(eq(leads.id, input.id)).limit(1);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Лид не найден" });
      if (ctx.user.role === "customer") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Недостаточно прав" });
      }
      const values: Partial<typeof leads.$inferInsert> = {};
      if (input.status !== undefined) values.status = input.status;
      if (input.assignedTo !== undefined) values.assignedTo = input.assignedTo;
      if (input.notes !== undefined) values.notes = input.notes || null;
      if (input.projectId !== undefined) values.projectId = input.projectId;
      if (input.customerId !== undefined) values.customerId = input.customerId;
      await db.update(leads).set(values).where(eq(leads.id, input.id));
      return { success: true };
    }),

  delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [lead] = await db.select().from(leads).where(eq(leads.id, input.id)).limit(1);
    if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Лид не найден" });
    if (ctx.user.role !== "director") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Недостаточно прав" });
    }
    await db.delete(leads).where(eq(leads.id, input.id));
    return { success: true };
  }),
});
