import { relations } from "drizzle-orm";
import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, double, index } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["director", "foreman", "customer"]).default("customer").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects, { relationName: "owner" }),
  memberships: many(projectMembers),
  messages: many(chatMessages),
  workLogs: many(workLogs),
}));

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  status: mysqlEnum("status", ["active", "paused", "completed", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate"),
  plannedEndDate: timestamp("plannedEndDate"),
  actualEndDate: timestamp("actualEndDate"),
  lat: double("lat"),
  lng: double("lng"),
  directorId: int("directorId").notNull(),
  customerId: int("customerId"),
  primaryForemanId: int("primaryForemanId"),
  progressPercent: int("progressPercent").default(0).notNull(),
  budget: int("budget"),
  metadata: json("metadata").default("{}"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => [
  index("directorIdx").on(t.directorId),
  index("customerIdx").on(t.customerId),
  index("foremanIdx").on(t.primaryForemanId),
]);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  director: one(users, { fields: [projects.directorId], references: [users.id], relationName: "owner" }),
  customer: one(users, { fields: [projects.customerId], references: [users.id] }),
  foreman: one(users, { fields: [projects.primaryForemanId], references: [users.id] }),
  members: many(projectMembers),
  stages: many(stages),
  media: many(media),
  documents: many(documents),
  workLogs: many(workLogs),
  chatMessages: many(chatMessages),
  cameras: many(cameras),
  activityLogs: many(activityLogs),
  notifications: many(notifications),
  aiReports: many(aiReports),
}));

export const projectMembers = mysqlTable("projectMembers", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["viewer", "foreman", "admin"]).default("viewer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("pmProjectIdx").on(t.projectId),
  index("pmUserIdx").on(t.userId),
]);

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const stages = mysqlTable("stages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  orderIndex: int("orderIndex").default(0).notNull(),
  status: mysqlEnum("status", ["planned", "active", "done", "blocked"]).default("planned").notNull(),
  plannedStart: timestamp("plannedStart"),
  plannedEnd: timestamp("plannedEnd"),
  actualStart: timestamp("actualStart"),
  actualEnd: timestamp("actualEnd"),
  progressPercent: int("progressPercent").default(0).notNull(),
  dependsOnStageId: int("dependsOnStageId"),
  reviewStatus: mysqlEnum("reviewStatus", ["pending", "accepted", "rejected"]).default("pending").notNull(),
  reviewComment: text("reviewComment"),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => [
  index("stageProjectIdx").on(t.projectId),
]);

export const stagesRelations = relations(stages, ({ one, many }) => ({
  project: one(projects, { fields: [stages.projectId], references: [projects.id] }),
  media: many(media),
  workLogs: many(workLogs),
}));

export const media = mysqlTable("media", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  stageId: int("stageId"),
  type: mysqlEnum("type", ["photo", "video"]).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  thumbnailUrl: varchar("thumbnailUrl", { length: 1000 }),
  originalName: varchar("originalName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"),
  aiTags: json("aiTags").default("[]"),
  aiDescription: text("aiDescription"),
  takenAt: timestamp("takenAt"),
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("mediaProjectIdx").on(t.projectId),
  index("mediaStageIdx").on(t.stageId),
]);

export const mediaRelations = relations(media, ({ one }) => ({
  project: one(projects, { fields: [media.projectId], references: [projects.id] }),
  stage: one(stages, { fields: [media.stageId], references: [stages.id] }),
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}));

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  category: mysqlEnum("category", ["contract", "drawing", "act", "estimate", "other"]).default("other").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  originalName: varchar("originalName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  size: int("size"),
  uploadedBy: int("uploadedBy").notNull(),
  signatureStatus: mysqlEnum("signatureStatus", ["unsigned", "pending", "signed"]).default("unsigned").notNull(),
  signedBy: int("signedBy"),
  signedAt: timestamp("signedAt"),
  signerComment: text("signerComment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("docProjectIdx").on(t.projectId),
]);

export const documentsRelations = relations(documents, ({ one }) => ({
  project: one(projects, { fields: [documents.projectId], references: [projects.id] }),
  uploader: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
}));

export const workLogs = mysqlTable("workLogs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  stageId: int("stageId"),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  weather: varchar("weather", { length: 100 }),
  peopleCount: int("peopleCount"),
  hours: int("hours"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("wlProjectIdx").on(t.projectId),
  index("wlStageIdx").on(t.stageId),
]);

export const workLogsRelations = relations(workLogs, ({ one }) => ({
  project: one(projects, { fields: [workLogs.projectId], references: [projects.id] }),
  stage: one(stages, { fields: [workLogs.stageId], references: [stages.id] }),
  author: one(users, { fields: [workLogs.createdBy], references: [users.id] }),
}));

export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  senderId: int("senderId").notNull(),
  type: mysqlEnum("type", ["text", "photo", "document", "system"]).default("text").notNull(),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachmentUrl", { length: 1000 }),
  readBy: json("readBy").default("[]"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("chatProjectIdx").on(t.projectId),
  index("chatSenderIdx").on(t.senderId),
]);

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  project: one(projects, { fields: [chatMessages.projectId], references: [projects.id] }),
  sender: one(users, { fields: [chatMessages.senderId], references: [users.id] }),
}));

export const cameras = mysqlTable("cameras", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  rtspUrl: varchar("rtspUrl", { length: 1000 }).notNull(),
  onvifConfig: json("onvifConfig").default("{}"),
  status: mysqlEnum("status", ["online", "offline", "error"]).default("offline").notNull(),
  recordingEnabled: boolean("recordingEnabled").default(true),
  retentionDays: int("retentionDays").default(14),
  streamPath: varchar("streamPath", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => [
  index("cameraProjectIdx").on(t.projectId),
]);

export const camerasRelations = relations(cameras, ({ one, many }) => ({
  project: one(projects, { fields: [cameras.projectId], references: [projects.id] }),
  recordings: many(cameraRecordings),
  snapshots: many(cameraSnapshots),
}));

export const cameraRecordings = mysqlTable("cameraRecordings", {
  id: int("id").autoincrement().primaryKey(),
  cameraId: int("cameraId").notNull(),
  startedAt: timestamp("startedAt").notNull(),
  endedAt: timestamp("endedAt"),
  segmentPath: varchar("segmentPath", { length: 1000 }).notNull(),
  durationSec: int("durationSec"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("recCameraIdx").on(t.cameraId),
]);

export const cameraRecordingsRelations = relations(cameraRecordings, ({ one }) => ({
  camera: one(cameras, { fields: [cameraRecordings.cameraId], references: [cameras.id] }),
}));

export const cameraSnapshots = mysqlTable("cameraSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  cameraId: int("cameraId").notNull(),
  takenAt: timestamp("takenAt").notNull(),
  imageUrl: varchar("imageUrl", { length: 1000 }).notNull(),
  triggeredBy: mysqlEnum("triggeredBy", ["schedule", "user", "ai"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("snapCameraIdx").on(t.cameraId),
]);

export const cameraSnapshotsRelations = relations(cameraSnapshots, ({ one }) => ({
  camera: one(cameras, { fields: [cameraSnapshots.cameraId], references: [cameras.id] }),
}));

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  channel: mysqlEnum("channel", ["in_app", "push", "email", "max"]).default("in_app").notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("notifUserIdx").on(t.userId),
  index("notifProjectIdx").on(t.projectId),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  project: one(projects, { fields: [notifications.projectId], references: [projects.id] }),
}));

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  fileUrl: varchar("fileUrl", { length: 1000 }),
  status: mysqlEnum("status", ["pending", "ready", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("reportProjectIdx").on(t.projectId),
]);

export const reportsRelations = relations(reports, ({ one }) => ({
  project: one(projects, { fields: [reports.projectId], references: [projects.id] }),
}));

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["new", "in_progress", "contract", "project", "cancelled"]).default("new").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  email: varchar("email", { length: 255 }),
  message: text("message"),
  service: varchar("service", { length: 255 }),
  buildingType: varchar("buildingType", { length: 255 }),
  metadata: text("metadata"),
  assignedTo: int("assignedTo"),
  projectId: int("projectId"),
  customerId: int("customerId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, t => [
  index("leadStatusIdx").on(t.status),
  index("leadSourceIdx").on(t.source),
]);

export const leadsRelations = relations(leads, ({ one }) => ({
  project: one(projects, { fields: [leads.projectId], references: [projects.id] }),
  assignedUser: one(users, { fields: [leads.assignedTo], references: [users.id] }),
  customer: one(users, { fields: [leads.customerId], references: [users.id] }),
}));

export const passwordResetTokens = mysqlTable("passwordResetTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("resetTokenIdx").on(t.token),
  index("resetUserIdx").on(t.userId),
]);

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  actorId: int("actorId"),
  action: varchar("action", { length: 64 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  diff: json("diff").default("{}"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("actProjectIdx").on(t.projectId),
]);

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  project: one(projects, { fields: [activityLogs.projectId], references: [projects.id] }),
  actor: one(users, { fields: [activityLogs.actorId], references: [users.id] }),
}));

export const aiReports = mysqlTable("aiReports", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  reportType: mysqlEnum("reportType", ["daily", "weekly", "summary"]).default("daily").notNull(),
  periodStart: timestamp("periodStart"),
  periodEnd: timestamp("periodEnd"),
  content: text("content").notNull(),
  generatedBy: mysqlEnum("generatedBy", ["user", "system", "ai"]).default("ai").notNull(),
  status: mysqlEnum("status", ["draft", "ready", "error"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, t => [
  index("aiProjectIdx").on(t.projectId),
]);

export const aiReportsRelations = relations(aiReports, ({ one }) => ({
  project: one(projects, { fields: [aiReports.projectId], references: [projects.id] }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type Stage = typeof stages.$inferSelect;
export type InsertStage = typeof stages.$inferInsert;
export type MediaItem = typeof media.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type WorkLog = typeof workLogs.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type Camera = typeof cameras.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type AiReport = typeof aiReports.$inferSelect;
