import { describe, it, expect } from "vitest";
import { isGroqAvailable, groqChat } from "./groq";

describe.skipIf(!process.env.GROQ_API_KEY)("Groq API configuration", () => {
  it("GROQ_API_KEY env var is set", () => {
    const key = process.env.GROQ_API_KEY;
    expect(key).toBeTruthy();
    expect(typeof key).toBe("string");
    expect(key!.startsWith("gsk_")).toBe(true);
  });

  it("isGroqAvailable returns true when key is set", () => {
    expect(isGroqAvailable()).toBe(true);
  });

  it("groqChat returns a response for a simple question", async () => {
    const result = await groqChat([
      { role: "user", content: "Ответь одним словом: какой сейчас год?" }
    ], "llama-3.1-8b-instant", 50, 10000);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  }, 15000);
});
