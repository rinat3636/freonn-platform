const MAX_BOT_TOKEN = (process.env.MAX_BOT_TOKEN || "").trim();
const MAX_API_URL = "https://platform-api.max.ru/messages";
const MAX_USER_IDS = [161746887, 214386106];

export async function sendMaxMessage(text: string): Promise<boolean> {
  if (!MAX_BOT_TOKEN) return false;
  let anyOk = false;
  for (const userId of MAX_USER_IDS) {
    try {
      const res = await fetch(`${MAX_API_URL}?user_id=${userId}`, {
        method: "POST",
        headers: {
          Authorization: MAX_BOT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        anyOk = true;
      } else {
        console.error(`[MAX] Failed to send to user ${userId}:`, res.status);
      }
    } catch (e) {
      console.error(`[MAX] Error sending to user ${userId}:`, e);
    }
  }
  return anyOk;
}
