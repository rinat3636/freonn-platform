import { z } from "zod";
import { and, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, staffProcedure, router } from "../_core/trpc";
import { media, documents, workLogs, chatMessages, notifications, activityLogs, aiReports, users } from "../../drizzle/schema";
import { createNotification, getDbOrThrow, logActivity, omitPassword, requireProjectAccess, schema } from "./_shared";
import { groqChat, GROQ_CONTENT_MODEL } from "../groq";

// ───────────────── Media ─────────────────
const mediaInput = z.object({
  projectId: z.number().int(),
  stageId: z.number().int().optional(),
  type: z.enum(["photo", "video"]),
  url: z.string().url(),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().optional(),
  takenAt: z.coerce.date().optional(),
});

const contentByProject = z.object({ projectId: z.number().int(), stageId: z.number().int().optional() });

// ───────────────── Documents ─────────────────
const documentInput = z.object({
  projectId: z.number().int(),
  category: z.enum(["contract", "drawing", "act", "estimate", "other"]),
  name: z.string().min(2),
  url: z.string().url(),
  originalName: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().int().optional(),
});

// ───────────────── WorkLogs ─────────────────
const workLogInput = z.object({
  projectId: z.number().int(),
  stageId: z.number().int().optional(),
  date: z.coerce.date(),
  description: z.string().min(2),
  weather: z.string().optional(),
  peopleCount: z.number().int().optional(),
  hours: z.number().int().optional(),
});

// ───────────────── Chat ─────────────────
const chatInput = z.object({
  projectId: z.number().int(),
  content: z.string().min(1),
  type: z.enum(["text", "photo", "document", "system"]).default("text"),
  attachmentUrl: z.string().url().optional(),
});

// ───────────────── AI report ─────────────────
const aiReportInput = z.object({
  projectId: z.number().int(),
  type: z.enum(["daily", "weekly", "summary"]).default("daily"),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

export const contentRouter = router({
  // ───────────────── Media ─────────────────
  mediaList: protectedProcedure.input(contentByProject).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(media)
      .where(and(eq(media.projectId, input.projectId), input.stageId ? eq(media.stageId, input.stageId) : undefined as any))
      .orderBy(desc(media.createdAt));
    return rows;
  }),

  mediaCreate: protectedProcedure.input(mediaInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "foreman");
    const result = await db.insert(media).values({
      projectId: input.projectId,
      stageId: input.stageId,
      type: input.type,
      url: input.url,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      takenAt: input.takenAt,
      uploadedBy: ctx.user.id,
    });
    const mediaId = Number(result[0]?.insertId);
    await logActivity(db, input.projectId, ctx.user.id, "MEDIA_UPLOADED", "media", mediaId, { type: input.type, url: input.url });
    return { id: mediaId };
  }),

  mediaDelete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [item] = await db.select().from(media).where(eq(media.id, input.id)).limit(1);
    if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Файл не найден" });
    await requireProjectAccess(db, ctx.user, item.projectId, "admin");
    await db.delete(media).where(eq(media.id, input.id));
    await logActivity(db, item.projectId, ctx.user.id, "MEDIA_DELETED", "media", input.id);
    return { success: true };
  }),

  // ───────────────── Documents ─────────────────
  documentsList: protectedProcedure.input(contentByProject).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, input.projectId))
      .orderBy(desc(documents.createdAt));
    return rows;
  }),

  documentCreate: protectedProcedure.input(documentInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "foreman");
    const result = await db.insert(documents).values({
      projectId: input.projectId,
      category: input.category,
      name: input.name,
      url: input.url,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      uploadedBy: ctx.user.id,
    });
    const docId = Number(result[0]?.insertId);
    await createNotification(db, {
      userId: ctx.user.id,
      projectId: input.projectId,
      type: "document_added",
      title: "Новый документ",
      body: `Добавлен документ: ${input.name}`,
    });
    await logActivity(db, input.projectId, ctx.user.id, "DOCUMENT_UPLOADED", "document", docId, { name: input.name });
    return { id: docId };
  }),

  documentDelete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [item] = await db.select().from(documents).where(eq(documents.id, input.id)).limit(1);
    if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Документ не найден" });
    await requireProjectAccess(db, ctx.user, item.projectId, "admin");
    await db.delete(documents).where(eq(documents.id, input.id));
    await logActivity(db, item.projectId, ctx.user.id, "DOCUMENT_DELETED", "document", input.id);
    return { success: true };
  }),

  // ───────────────── WorkLogs ─────────────────
  workLogsList: protectedProcedure.input(z.object({ projectId: z.number().int(), stageId: z.number().int().optional() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(workLogs)
      .where(and(eq(workLogs.projectId, input.projectId), input.stageId ? eq(workLogs.stageId, input.stageId) : undefined as any))
      .orderBy(desc(workLogs.date));
    const withUsers = await Promise.all(
      rows.map(async r => {
        const [u] = await db.select().from(users).where(eq(users.id, r.createdBy)).limit(1);
        return { ...r, author: u ? omitPassword(u) : null };
      })
    );
    return withUsers;
  }),

  workLogCreate: protectedProcedure.input(workLogInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "foreman");
    const result = await db.insert(workLogs).values({
      projectId: input.projectId,
      stageId: input.stageId,
      date: input.date,
      description: input.description,
      weather: input.weather,
      peopleCount: input.peopleCount,
      hours: input.hours,
      createdBy: ctx.user.id,
    });
    const logId = Number(result[0]?.insertId);
    await logActivity(db, input.projectId, ctx.user.id, "WORKLOG_CREATED", "workLog", logId);
    return { id: logId };
  }),

  workLogDelete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [item] = await db.select().from(workLogs).where(eq(workLogs.id, input.id)).limit(1);
    if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Запись не найдена" });
    await requireProjectAccess(db, ctx.user, item.projectId, "foreman");
    await db.delete(workLogs).where(eq(workLogs.id, input.id));
    await logActivity(db, item.projectId, ctx.user.id, "WORKLOG_DELETED", "workLog", input.id);
    return { success: true };
  }),

  // ───────────────── Chat ─────────────────
  chatList: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.projectId, input.projectId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(200);
    const withSenders = await Promise.all(
      rows.map(async r => {
        const [u] = await db.select().from(users).where(eq(users.id, r.senderId)).limit(1);
        return { ...r, sender: u ? omitPassword(u) : null };
      })
    );
    return withSenders.reverse();
  }),

  chatSend: protectedProcedure.input(chatInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const result = await db.insert(chatMessages).values({
      projectId: input.projectId,
      senderId: ctx.user.id,
      type: input.type,
      content: input.content,
      attachmentUrl: input.attachmentUrl,
    });
    const messageId = Number(result[0]?.insertId);

    const projectMembers = await db
      .select({ userId: users.id })
      .from(users)
      .innerJoin(schema.projectMembers, eq(schema.projectMembers.userId, users.id))
      .where(eq(schema.projectMembers.projectId, input.projectId));
    for (const m of projectMembers) {
      if (m.userId !== ctx.user.id) {
        await createNotification(db, {
          userId: m.userId,
          projectId: input.projectId,
          type: "chat_message",
          title: "Новое сообщение в чате",
          body: input.content.slice(0, 120),
        });
      }
    }
    await logActivity(db, input.projectId, ctx.user.id, "CHAT_SENT", "chatMessage", messageId);
    return { id: messageId };
  }),

  // ───────────────── Activity logs ─────────────────
  activityList: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.projectId, input.projectId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(200);
    const withActors = await Promise.all(
      rows.map(async r => {
        if (!r.actorId) return { ...r, actor: null };
        const [u] = await db.select().from(users).where(eq(users.id, r.actorId)).limit(1);
        return { ...r, actor: u ? omitPassword(u) : null };
      })
    );
    return withActors;
  }),

  // ───────────────── Notifications ─────────────────
  notificationsList: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDbOrThrow();
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, ctx.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(100);
    return rows;
  }),

  notificationsMarkRead: protectedProcedure.input(z.object({ ids: z.array(z.number().int()) })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(and(eq(notifications.userId, ctx.user.id), inArray(notifications.id, input.ids)));
    return { success: true };
  }),

  // ───────────────── AI Reports ─────────────────
  aiReportsList: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db
      .select()
      .from(aiReports)
      .where(eq(aiReports.projectId, input.projectId))
      .orderBy(desc(aiReports.createdAt));
    return rows;
  }),

  aiReportGenerate: protectedProcedure.input(aiReportInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");

    const projectRows = await db.select().from(schema.projects).where(eq(schema.projects.id, input.projectId)).limit(1);
    const project = projectRows[0];
    const stageRows = await db.select().from(schema.stages).where(eq(schema.stages.projectId, input.projectId));
    const logRows = await db
      .select()
      .from(workLogs)
      .where(eq(workLogs.projectId, input.projectId))
      .orderBy(desc(workLogs.date))
      .limit(20);

    const prompt = [
      "Ты — помощник прораба. Составь краткий отчет по строительному объекту на основе данных ниже.",
      "Объект:",
      `Название: ${project?.name ?? "—"}`,
      `Адрес: ${project?.address ?? "—"}`,
      `Прогресс: ${project?.progressPercent ?? 0}%`,
      "Этапы:",
      ...stageRows.map(s => `- ${s.name}: ${s.status} (${s.progressPercent}%)`),
      "Журнал работ (последние 20):",
      ...logRows.map(l => `- ${l.date.toLocaleDateString("ru-RU")}: ${l.description}`),
      "Напиши отчет кратко, по пунктам: 1) общая ситуация, 2) что сделано, 3) что планируется, 4) риски/замечания.",
    ].join("\n");

    const content = await groqChat(
      [
        { role: "system", content: "Ты ассистент строительной платформы Freonn. Отвечай на русском языке, лаконично." },
        { role: "user", content: prompt },
      ],
      GROQ_CONTENT_MODEL,
      1200
    );

    const finalContent = content ?? "Отчет сформирован без участия AI (API недоступен).";
    const result = await db.insert(aiReports).values({
      projectId: input.projectId,
      reportType: input.type,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      content: finalContent,
      generatedBy: "ai",
      status: content ? "ready" : "draft",
    });
    const reportId = Number(result[0]?.insertId);
    await logActivity(db, input.projectId, ctx.user.id, "AI_REPORT_GENERATED", "aiReport", reportId, { type: input.type });
    return { id: reportId, content: finalContent };
  }),
});
