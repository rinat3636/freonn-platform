import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, directorProcedure, router } from "../_core/trpc";
import { projects, projectMembers, users } from "../../drizzle/schema";
import {
  createNotification,
  getAllowedProjectIds,
  getDbOrThrow,
  logActivity,
  omitPassword,
  requireProjectAccess,
  schema,
} from "./_shared";

const projectInput = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  startDate: z.coerce.date().optional(),
  plannedEndDate: z.coerce.date().optional(),
  customerId: z.number().int().optional(),
  primaryForemanId: z.number().int().optional(),
  budget: z.number().int().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const memberInput = z.object({
  projectId: z.number().int(),
  userId: z.number().int(),
  role: z.enum(["viewer", "foreman", "admin"]),
});

export const projectsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDbOrThrow();
    const allowed = await getAllowedProjectIds(db, ctx.user);
    const query = db.select().from(projects);
    const rows = allowed === null ? await query : await query.where(inArray(projects.id, allowed));

    const ids = rows.map(r => r.id);
    const allMembers = ids.length
      ? await db
          .select({ projectId: projectMembers.projectId, role: projectMembers.role, user: { id: users.id, name: users.name } })
          .from(projectMembers)
          .innerJoin(users, eq(projectMembers.userId, users.id))
          .where(inArray(projectMembers.projectId, ids))
      : [];

    const withMembers = rows.map(p => ({
      ...p,
      members: allMembers.filter(m => m.projectId === p.id).map(m => ({ ...m.user, role: m.role })),
    }));

    return withMembers;
  }),

  get: protectedProcedure.input(z.object({ id: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.id);
    const [project] = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
    if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Объект не найден" });

    const [director, customer, foreman] = await Promise.all([
      db.select().from(users).where(eq(users.id, project.directorId)).limit(1).then(r => r[0] ?? null),
      project.customerId ? db.select().from(users).where(eq(users.id, project.customerId)).limit(1).then(r => r[0] ?? null) : null,
      project.primaryForemanId ? db.select().from(users).where(eq(users.id, project.primaryForemanId)).limit(1).then(r => r[0] ?? null) : null,
    ]);

    const members = await db
      .select({ user: { id: users.id, name: users.name, email: users.email, role: users.role }, role: projectMembers.role })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, input.id));

    return {
      ...project,
      director: director ? omitPassword(director) : null,
      customer: customer ? omitPassword(customer) : null,
      foreman: foreman ? omitPassword(foreman) : null,
      members: members.map(m => ({ ...m.user, role: m.role })),
    };
  }),

  create: directorProcedure.input(projectInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const result = await db.insert(projects).values({
      name: input.name,
      address: input.address,
      startDate: input.startDate,
      plannedEndDate: input.plannedEndDate,
      lat: input.lat,
      lng: input.lng,
      directorId: ctx.user.id,
      customerId: input.customerId,
      primaryForemanId: input.primaryForemanId,
      budget: input.budget,
    });
    const projectId = Number(result[0]?.insertId);
    await logActivity(db, projectId, ctx.user.id, "PROJECT_CREATED", "project", projectId);
    return { id: projectId };
  }),

  update: protectedProcedure.input(z.object({ id: z.number().int(), data: projectInput.partial() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const { project } = await requireProjectAccess(db, ctx.user, input.id, "admin");
    const values: Partial<typeof input.data> = {};
    if (input.data.name !== undefined) values.name = input.data.name;
    if (input.data.address !== undefined) values.address = input.data.address;
    if (input.data.startDate !== undefined) values.startDate = input.data.startDate;
    if (input.data.plannedEndDate !== undefined) values.plannedEndDate = input.data.plannedEndDate;
    if (input.data.customerId !== undefined) values.customerId = input.data.customerId;
    if (input.data.primaryForemanId !== undefined) values.primaryForemanId = input.data.primaryForemanId;
    if (input.data.budget !== undefined) values.budget = input.data.budget;
    if (input.data.lat !== undefined) values.lat = input.data.lat;
    if (input.data.lng !== undefined) values.lng = input.data.lng;

    await db.update(projects).set(values).where(eq(projects.id, input.id));
    await logActivity(db, input.id, ctx.user.id, "PROJECT_UPDATED", "project", input.id, values as Record<string, unknown>);
    return { success: true };
  }),

  delete: directorProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const access = await requireProjectAccess(db, ctx.user, input.id, "admin");
    await db.delete(projects).where(eq(projects.id, input.id));
    await logActivity(db, input.id, ctx.user.id, "PROJECT_DELETED", "project", input.id);
    return { success: true, project: access.project };
  }),

  addMember: directorProcedure.input(memberInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "admin");
    const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Пользователь не найден" });

    await db.insert(projectMembers).values({
      projectId: input.projectId,
      userId: input.userId,
      role: input.role,
    });

    await createNotification(db, {
      userId: input.userId,
      projectId: input.projectId,
      type: "member_added",
      title: "Добавлены на объект",
      body: `Вас добавили на объект с ролью ${input.role}`,
    });

    await logActivity(db, input.projectId, ctx.user.id, "MEMBER_ADDED", "projectMember", input.userId, { role: input.role });
    return { success: true };
  }),

  removeMember: directorProcedure.input(z.object({ projectId: z.number().int(), userId: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "admin");
    await db
      .delete(projectMembers)
      .where(and(eq(projectMembers.projectId, input.projectId), eq(projectMembers.userId, input.userId)));
    await logActivity(db, input.projectId, ctx.user.id, "MEMBER_REMOVED", "projectMember", input.userId);
    return { success: true };
  }),

  geocode: protectedProcedure.input(z.object({ address: z.string().min(1) })).query(async ({ input }) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(input.address)}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "FreonnPlatform/1.0" } });
      const json = await res.json() as Array<{ lat: string; lon: string }>;
      if (!Array.isArray(json) || json.length === 0) throw new Error("Адрес не найден");
      return { lat: Number(json[0].lat), lng: Number(json[0].lon) };
    } catch (e: any) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message || "Ошибка геокодирования" });
    }
  }),
});
