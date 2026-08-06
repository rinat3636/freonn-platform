import fs from "node:fs";
import path from "node:path";
import cron from "node-cron";
import pdfMake from "pdfmake/build/pdfmake.js";
import * as pdfFonts from "pdfmake/build/vfs_fonts.js";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { getUploadDir } from "../_core/paths";
import { notifyProjectStakeholders } from "../routers/_shared";
import { ENV } from "../_core/env";

(pdfMake as any).vfs = pdfFonts;

function uploadPathToBase64(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  const match = fileUrl.match(/\/uploads\/(.+)$/);
  if (!match) return null;
  const filePath = path.join(getUploadDir(), match[1]);
  if (!fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/jpeg";
  const buffer = fs.readFileSync(filePath);
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU");
}

export async function generateProjectReport(
  projectId: number,
  type: string,
  periodStart?: Date,
  periodEnd?: Date,
  generatedBy?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, projectId)).limit(1);
  if (!project) throw new Error("Project not found");

  const now = new Date();
  const start = periodStart ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const end = periodEnd ?? now;

  const [stages, media, logs, documents] = await Promise.all([
    db.select().from(schema.stages).where(eq(schema.stages.projectId, projectId)).orderBy(schema.stages.orderIndex),
    db
      .select()
      .from(schema.media)
      .where(
        and(
          eq(schema.media.projectId, projectId),
          gte(schema.media.createdAt, start),
          lte(schema.media.createdAt, end)
        )
      )
      .orderBy(desc(schema.media.createdAt))
      .limit(8),
    db
      .select()
      .from(schema.workLogs)
      .where(
        and(
          eq(schema.workLogs.projectId, projectId),
          gte(schema.workLogs.date, start),
          lte(schema.workLogs.date, end)
        )
      )
      .orderBy(desc(schema.workLogs.date))
      .limit(20),
    db
      .select()
      .from(schema.documents)
      .where(
        and(
          eq(schema.documents.projectId, projectId),
          gte(schema.documents.createdAt, start),
          lte(schema.documents.createdAt, end)
        )
      )
      .orderBy(desc(schema.documents.createdAt))
      .limit(20),
  ]);

  const statusLabel: Record<string, string> = {
    planned: "Запланирован",
    active: "В работе",
    done: "Выполнен",
    blocked: "Заблокирован",
  };

  const stageRows = stages.map(s => [
    s.name,
    statusLabel[s.status] ?? s.status,
    `${s.progressPercent}%`,
    formatDate(s.plannedStart),
    formatDate(s.plannedEnd),
  ]);

  const images: any[] = media
    .map(m => uploadPathToBase64(m.thumbnailUrl || m.url))
    .filter(Boolean)
    .slice(0, 4)
    .map((img, i) => ({
      image: img,
      width: 240,
      margin: i % 2 === 0 ? [0, 0, 10, 10] : [0, 0, 0, 10],
    }));

  const docDefinition: any = {
    info: { title: `Отчёт ${project.name}` },
    content: [
      { text: project.name, style: "header" },
      { text: `Отчёт за период ${formatDate(start)} — ${formatDate(end)}`, style: "subheader" },
      {
        columns: [
          { text: `Прогресс: ${project.progressPercent}%`, width: "auto" },
          { text: `Статус: ${project.status}`, width: "auto" },
        ],
        columnGap: 20,
        margin: [0, 0, 0, 10],
      },
      { text: "Этапы", style: "section" },
      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto"],
          body: [
            ["Этап", "Статус", "Прогресс", "Начало", "Окончание"],
            ...stageRows,
          ],
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 15],
      },
      logs.length
        ? [
            { text: "Журнал работ", style: "section" },
            ...logs.map(l => ({ text: `${formatDate(l.date)} — ${l.description || "—"}`, margin: [0, 0, 0, 4] })),
          ]
        : { text: "Журнал работ: записей нет", margin: [0, 0, 0, 15] },
      documents.length
        ? [
            { text: "Новые документы", style: "section" },
            ...documents.map(d => ({ text: `• ${d.name}`, margin: [0, 0, 0, 2] })),
          ]
        : { text: "Новые документы: нет", margin: [0, 0, 0, 15] },
      images.length ? { text: "Фото за период", style: "section", pageBreak: "before" } : {},
      images.length
        ? {
            columns: images,
            columnGap: 10,
          }
        : {},
    ],
    styles: {
      header: { fontSize: 22, bold: true, margin: [0, 0, 0, 10] },
      subheader: { fontSize: 14, color: "#666", margin: [0, 0, 0, 15] },
      section: { fontSize: 14, bold: true, margin: [0, 15, 0, 8] },
    },
    defaultStyle: { font: "Roboto" },
  };

  const publicUrl = ENV.appPublicUrl.replace(/\/$/, "");
  const reportDir = path.join(getUploadDir(), "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const fileName = `${projectId}-${type}-${Date.now()}.pdf`;
  const filePath = path.join(reportDir, fileName);
  const fileUrl = `${publicUrl}/uploads/reports/${fileName}`;

  const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
  const buffer = await pdfDocGenerator.getBuffer();
  fs.writeFileSync(filePath, buffer);

  const [reportResult] = await db
    .insert(schema.reports)
    .values({
      projectId,
      type,
      title: `Отчёт ${project.name} (${formatDate(start)} — ${formatDate(end)})`,
      periodStart: start,
      periodEnd: end,
      fileUrl,
      status: "ready",
      createdAt: new Date(),
    });
  const reportId = Number(reportResult?.insertId);

  await notifyProjectStakeholders(db, projectId, generatedBy ?? null, {
    type: "report_ready",
    title: "Готов PDF-отчёт",
    body: `Отчёт по объекту «${project.name}» готов`,
  });

  return { reportId, fileUrl };
}

export async function runWeeklyReports() {
  const db = await getDb();
  if (!db) return;
  const activeProjects = await db.select().from(schema.projects).where(eq(schema.projects.status, "active"));
  const now = new Date();
  const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  for (const project of activeProjects) {
    try {
      await generateProjectReport(project.id, "weekly", start, now);
      console.log(`[reports] generated weekly report for project ${project.id}`);
    } catch (error) {
      console.error(`[reports] failed to generate report for project ${project.id}:`, error);
    }
  }
}

export function startReportJobs() {
  if (process.env.DISABLE_REPORT_JOBS === "true") return;
  // Monday 09:00
  cron.schedule("0 9 * * 1", () => {
    console.log("[reports] running weekly report generation");
    runWeeklyReports().catch(e => console.error("[reports] cron error:", e));
  });
}
