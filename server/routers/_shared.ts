import { TRPCError } from "@trpc/server";
import { and, eq, inArray, or } from "drizzle-orm";
import * as schema from "../../drizzle/schema";
import { getDb } from "../db";

type User = schema.User;
type ProjectRole = "viewer" | "foreman" | "admin";

const ROLE_LEVEL: Record<ProjectRole, number> = { viewer: 1, foreman: 2, admin: 3 };

export type Access = {
  project: schema.Project;
  role: ProjectRole;
};

export async function getDbOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

export function hasRole(level: ProjectRole, required: ProjectRole) {
  return ROLE_LEVEL[level] >= ROLE_LEVEL[required];
}

export async function getProjectAccess(
  db: Awaited<ReturnType<typeof getDb>> & {},
  user: User,
  projectId: number
): Promise<Access | null> {
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1);
  if (!project) return null;

  if (user.role === "director" || project.directorId === user.id) {
    return { project, role: "admin" };
  }

  const [member] = await db
    .select()
    .from(schema.projectMembers)
    .where(and(eq(schema.projectMembers.projectId, projectId), eq(schema.projectMembers.userId, user.id)))
    .limit(1);
  if (member) {
    return { project, role: member.role as ProjectRole };
  }

  if (project.primaryForemanId === user.id) return { project, role: "foreman" };
  if (project.customerId === user.id) return { project, role: "viewer" };

  return null;
}

export async function requireProjectAccess(
  db: Awaited<ReturnType<typeof getDb>> & {},
  user: User,
  projectId: number,
  minRole: ProjectRole = "viewer"
): Promise<Access> {
  const access = await getProjectAccess(db, user, projectId);
  if (!access) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Объект не найден" });
  }
  if (!hasRole(access.role, minRole)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Недостаточно прав" });
  }
  return access;
}

export async function getAllowedProjectIds(db: Awaited<ReturnType<typeof getDb>> & {}, user: User): Promise<number[] | null> {
  if (user.role === "director") return null;

  const ids = new Set<number>();

  const memberRows = await db
    .select({ projectId: schema.projectMembers.projectId })
    .from(schema.projectMembers)
    .where(eq(schema.projectMembers.userId, user.id));
  for (const r of memberRows) ids.add(r.projectId);

  const assigned = await db
    .select({ id: schema.projects.id })
    .from(schema.projects)
    .where(or(eq(schema.projects.customerId, user.id), eq(schema.projects.primaryForemanId, user.id)));
  for (const r of assigned) ids.add(r.id);

  return Array.from(ids);
}

export async function recalcProjectProgress(db: Awaited<ReturnType<typeof getDb>> & {}, projectId: number) {
  const rows = await db.select({ progress: schema.stages.progressPercent }).from(schema.stages).where(eq(schema.stages.projectId, projectId));
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.progress, 0) / rows.length) : 0;
  await db.update(schema.projects).set({ progressPercent: avg }).where(eq(schema.projects.id, projectId));
}

export async function logActivity(
  db: Awaited<ReturnType<typeof getDb>> & {},
  projectId: number,
  actorId: number | null,
  action: string,
  entityType?: string,
  entityId?: number,
  diff?: Record<string, unknown>
) {
  await db.insert(schema.activityLogs).values({
    projectId,
    actorId,
    action,
    entityType,
    entityId,
    diff,
  });
}

export async function createNotification(
  db: Awaited<ReturnType<typeof getDb>> & {},
  input: {
    userId: number;
    projectId?: number;
    type: string;
    title: string;
    body: string;
    channel?: "in_app" | "push" | "email" | "max";
  }
) {
  await db.insert(schema.notifications).values({
    userId: input.userId,
    projectId: input.projectId,
    type: input.type,
    title: input.title,
    body: input.body,
    channel: input.channel ?? "in_app",
  });
}

export async function notifyProjectStakeholders(
  db: Awaited<ReturnType<typeof getDb>> & {},
  projectId: number,
  senderId: number | null,
  payload: {
    type: string;
    title: string;
    body: string;
    channel?: "in_app" | "push" | "email" | "max";
  }
) {
  const [project] = await db
    .select({ directorId: schema.projects.directorId, customerId: schema.projects.customerId })
    .from(schema.projects)
    .where(eq(schema.projects.id, projectId))
    .limit(1);
  const members = await db
    .select({ userId: schema.projectMembers.userId })
    .from(schema.projectMembers)
    .where(eq(schema.projectMembers.projectId, projectId));
  const recipients = new Set<number>();
  if (project?.directorId) recipients.add(project.directorId);
  if (project?.customerId) recipients.add(project.customerId);
  for (const m of members) recipients.add(m.userId);
  for (const userId of Array.from(recipients)) {
    if (userId === senderId) continue;
    await createNotification(db, { ...payload, userId, projectId });
  }
}

export function omitPassword<T extends { passwordHash?: string | null }>(user: T): Omit<T, "passwordHash"> {
  const { passwordHash, ...rest } = user;
  return rest as Omit<T, "passwordHash">;
}

// Re-export schema for convenience
export { schema };
