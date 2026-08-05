import { describe, it, expect } from "vitest";

describe.skipIf(!process.env.MAX_BOT_TOKEN)("MAX Bot configuration", () => {
  it("MAX_BOT_TOKEN env var is set", () => {
    const token = process.env.MAX_BOT_TOKEN;
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");
    expect(token!.length).toBeGreaterThan(5);
  });
});
