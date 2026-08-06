import nodemailer from "nodemailer";
import { ENV } from "./env";

type SendOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendEmail(options: SendOptions): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    console.warn("[mailer] SMTP not configured, skipping email to", options.to);
    console.log("[mailer] Would have sent:\n", options.text);
    return false;
  }
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || `"Freonn Platform" <noreply@freonn.ru>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("[mailer] failed to send email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = ENV.appPublicUrl.replace(/\/$/, "");
  const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const text = `Здравствуйте!\n\nДля сброса пароля перейдите по ссылке:\n${link}\n\nСсылка действительна 1 час.\n\nЕсли вы не запрашивали сброс пароля, проигнорируйте это письмо.`;
  return sendEmail({
    to: email,
    subject: "Сброс пароля Freonn Platform",
    text,
    html: `<p>Здравствуйте!</p><p>Для сброса пароля перейдите по ссылке:</p><p><a href="${link}">${link}</a></p><p>Ссылка действительна 1 час.</p>`,
  });
}
