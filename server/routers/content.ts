import { z } from "zod";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, staffProcedure, router } from "../_core/trpc";
import { media, documents, workLogs, chatMessages, notifications, activityLogs, aiReports, users } from "../../drizzle/schema";
import { notifyProjectStakeholders, getDbOrThrow, logActivity, omitPassword, requireProjectAccess, schema } from "./_shared";
import { groqChat, GROQ_CONTENT_MODEL, isGroqAvailable } from "../groq";

type FeedItem = {
  id: string;
  kind: "worklog" | "photo" | "video" | "document" | "stage";
  createdAt: Date;
  title: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  authorName?: string | null;
  meta?: Record<string, unknown>;
};

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
const chatInput = z
  .object({
    projectId: z.number().int(),
    content: z.string().max(4000).default(""),
    type: z.enum(["text", "photo", "document", "system"]).default("text"),
    attachmentUrl: z.string().url().optional(),
  })
  .refine(value => value.content.trim().length > 0 || !!value.attachmentUrl, {
    message: "Сообщение или вложение обязательно",
    path: ["content"],
  });

// ───────────────── AI report ─────────────────
const aiReportInput = z.object({
  projectId: z.number().int(),
  type: z.enum(["daily", "weekly", "summary"]).default("daily"),
  periodStart: z.coerce.date().optional(),
  periodEnd: z.coerce.date().optional(),
});

export const contentRouter = router({
  feed: protectedProcedure
    .input(z.object({ projectId: z.number().int(), limit: z.number().int().max(200).default(80) }))
    .query(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
      const [workLogRows, mediaRows, documentRows, activityRows] = await Promise.all([
        db.select().from(workLogs).where(eq(workLogs.projectId, input.projectId)).orderBy(desc(workLogs.createdAt)).limit(input.limit),
        db.select().from(media).where(eq(media.projectId, input.projectId)).orderBy(desc(media.createdAt)).limit(input.limit),
        db.select().from(documents).where(eq(documents.projectId, input.projectId)).orderBy(desc(documents.createdAt)).limit(input.limit),
        db
          .select()
          .from(activityLogs)
          .where(and(eq(activityLogs.projectId, input.projectId), eq(activityLogs.entityType, "stage")))
          .orderBy(desc(activityLogs.createdAt))
          .limit(input.limit),
      ]);

      const authorIds = Array.from(
        new Set([
          ...workLogRows.map(row => row.createdBy),
          ...mediaRows.map(row => row.uploadedBy),
          ...documentRows.map(row => row.uploadedBy),
          ...activityRows.flatMap(row => (row.actorId ? [row.actorId] : [])),
        ])
      );
      const authorRows = authorIds.length ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, authorIds)) : [];
      const authorNames = new Map(authorRows.map(user => [user.id, user.name]));

      const items: FeedItem[] = [
        ...workLogRows.map(row => ({
          id: `worklog-${row.id}`,
          kind: "worklog" as const,
          createdAt: row.createdAt,
          title: "Запись в журнале работ",
          description: row.description,
          authorName: authorNames.get(row.createdBy) ?? null,
          meta: { date: row.date, stageId: row.stageId, peopleCount: row.peopleCount, hours: row.hours },
        })),
        ...mediaRows.map(row => ({
          id: `${row.type}-${row.id}`,
          kind: row.type,
          createdAt: row.createdAt,
          title: row.originalName ?? (row.type === "photo" ? "Фотография" : "Видео"),
          url: row.url,
          thumbnailUrl: row.thumbnailUrl ?? undefined,
          authorName: authorNames.get(row.uploadedBy) ?? null,
          meta: { stageId: row.stageId, takenAt: row.takenAt },
        })),
        ...documentRows.map(row => ({
          id: `document-${row.id}`,
          kind: "document" as const,
          createdAt: row.createdAt,
          title: row.name,
          url: row.url,
          authorName: authorNames.get(row.uploadedBy) ?? null,
          meta: { category: row.category, originalName: row.originalName },
        })),
        ...activityRows.map(row => ({
          id: `stage-${row.id}`,
          kind: "stage" as const,
          createdAt: row.createdAt,
          title: row.action === "STAGE_CREATED" ? "Создан этап" : "Обновлён этап",
          description: row.action,
          authorName: row.actorId ? authorNames.get(row.actorId) ?? null : null,
          meta: { entityId: row.entityId, action: row.action, diff: row.diff },
        })),
      ];

      return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, input.limit);
    }),

  aiAsk: protectedProcedure
    .input(z.object({ projectId: z.number().int(), question: z.string().min(1).max(2000) }))
    .query(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      await requireProjectAccess(db, ctx.user, input.projectId, "viewer");

      const [[project], stageRows, logRows, documentRows, [photoCount], [videoCount], chatRows] = await Promise.all([
        db.select().from(schema.projects).where(eq(schema.projects.id, input.projectId)).limit(1),
        db.select().from(schema.stages).where(eq(schema.stages.projectId, input.projectId)).orderBy(asc(schema.stages.orderIndex)),
        db.select().from(workLogs).where(eq(workLogs.projectId, input.projectId)).orderBy(desc(workLogs.date)).limit(15),
        db.select().from(documents).where(eq(documents.projectId, input.projectId)).orderBy(desc(documents.createdAt)),
        db.select({ count: count() }).from(media).where(and(eq(media.projectId, input.projectId), eq(media.type, "photo"))),
        db.select({ count: count() }).from(media).where(and(eq(media.projectId, input.projectId), eq(media.type, "video"))),
        db.select().from(chatMessages).where(eq(chatMessages.projectId, input.projectId)).orderBy(desc(chatMessages.createdAt)).limit(10),
      ]);

      const contextUserIds = Array.from(new Set([...logRows.map(row => row.createdBy), ...chatRows.map(row => row.senderId)]));
      const contextUsers = contextUserIds.length
        ? await db.select({ id: users.id, name: users.name }).from(users).where(inArray(users.id, contextUserIds))
        : [];
      const contextNames = new Map(contextUsers.map(user => [user.id, user.name]));
      const projectName = project?.name ?? "—";
      const context = [
        "Данные объекта:",
        `Название: ${projectName}`,
        `Адрес: ${project?.address ?? "—"}`,
        `Статус: ${project?.status ?? "—"}`,
        `Прогресс: ${project?.progressPercent ?? 0}%`,
        `Плановая дата окончания: ${project?.plannedEndDate?.toLocaleDateString("ru-RU") ?? "—"}`,
        "Этапы:",
        ...stageRows.map(stage => `- ${stage.name}: ${stage.status}, ${stage.progressPercent}%`),
        "Последние записи журнала работ:",
        ...logRows.map(log => `- ${log.date.toLocaleDateString("ru-RU")}: ${log.description}`),
        "Документы:",
        ...documentRows.map(document => `- ${document.name} (${document.category})`),
        `Медиа: фотографий — ${Number(photoCount?.count ?? 0)}, видео — ${Number(videoCount?.count ?? 0)}`,
        "Последние сообщения чата:",
        ...chatRows
          .slice()
          .reverse()
          .map(
            message =>
              `- ${contextNames.get(message.senderId) ?? "Пользователь"}: ${message.content?.trim() || "[вложение]"}`
          ),
        `Вопрос пользователя: ${input.question}`,
      ].join("\n");

      const answer = await groqChat(
        [
          {
            role: "system",
            content:
              "Ты — ассистент строительной платформы Freonn. Ты помогаешь заказчику и прорабу понимать, что происходит на объекте. Отвечай на русском, кратко, по делу, опираясь только на предоставленные данные. Если данных недостаточно — честно скажи об этом.",
          },
          { role: "user", content: context },
        ],
        GROQ_CONTENT_MODEL,
        1000
      );

      if (!answer || !isGroqAvailable()) {
        return { answer: "AI временно недоступен (не настроен GROQ_API_KEY или сервис не отвечает).", available: false };
      }
      return { answer, available: true };
    }),

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
    await notifyProjectStakeholders(db, input.projectId, ctx.user.id, {
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

    await notifyProjectStakeholders(db, input.projectId, ctx.user.id, {
      type: "chat_message",
      title: "Новое сообщение в чате",
      body:
        input.content.trim().slice(0, 120) ||
        (input.type === "photo"
          ? "📷 Фото"
          : input.type === "document"
            ? "📎 Документ"
            : "Новое сообщение"),
    });
    await logActivity(db, input.projectId, ctx.user.id, "CHAT_SENT", "chatMessage", messageId);
    return { id: messageId };
  }),

  chatMarkRead: protectedProcedure
    .input(z.object({ projectId: z.number().int(), messageIds: z.array(z.number().int()).max(200) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
      if (!input.messageIds.length) return { success: true };

      const rows = await db
        .select()
        .from(chatMessages)
        .where(
          and(
            eq(chatMessages.projectId, input.projectId),
            inArray(chatMessages.id, input.messageIds)
          )
        );
      for (const row of rows) {
        const readBy = Array.isArray(row.readBy)
          ? row.readBy.filter((id): id is number => typeof id === "number")
          : [];
        if (row.senderId === ctx.user.id || readBy.includes(ctx.user.id)) continue;
        await db
          .update(chatMessages)
          .set({ readBy: [...readBy, ctx.user.id] })
          .where(eq(chatMessages.id, row.id));
      }
      return { success: true };
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
