function deriveGo2rtcPublicUrl(): string {
  const api = process.env.GO2RTC_API_URL ?? "http://localhost:1984";
  const app = process.env.APP_PUBLIC_URL;
  const port = process.env.GO2RTC_HOST_PORT;
  if (app && port) {
    try {
      const url = new URL(app);
      url.port = port;
      return url.toString();
    } catch {
      // fall through
    }
  }
  return process.env.GO2RTC_PUBLIC_URL ?? api;
}

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "freonn-platform",
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-min-32-chars-long",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  maxBotToken: process.env.MAX_BOT_TOKEN ?? "",
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  appPublicUrl: process.env.APP_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`,
  go2rtcApiUrl: process.env.GO2RTC_API_URL ?? "http://localhost:1984",
  go2rtcPublicUrl: deriveGo2rtcPublicUrl(),
};
