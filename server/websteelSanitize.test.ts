import { describe, it, expect } from "vitest";
import { sanitizePublicRegion } from "./websteel";

describe("sanitizePublicRegion", () => {
  it("returns trimmed region", () => {
    expect(sanitizePublicRegion("  Москва и МО  ")).toBe("Москва и МО");
  });

  it("takes first line only", () => {
    expect(sanitizePublicRegion("Казань\nDROP")).toBe("Казань");
  });

  it("rejects e-mail", () => {
    expect(sanitizePublicRegion("client@mail.ru")).toBeUndefined();
  });

  it("rejects URL", () => {
    expect(sanitizePublicRegion("https://evil.example/path")).toBeUndefined();
  });

  it("truncates long string", () => {
    const long = "а".repeat(150);
    expect(sanitizePublicRegion(long)?.length).toBe(100);
  });

  it("handles undefined and empty", () => {
    expect(sanitizePublicRegion(undefined)).toBeUndefined();
    expect(sanitizePublicRegion("   ")).toBeUndefined();
  });
});
