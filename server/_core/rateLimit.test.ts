import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
  it("calls next until max, then 429", () => {
    const mw = rateLimit({ windowMs: 60_000, max: 2 });
    const req = { ip: "10.0.0.1" } as Request;
    const next = vi.fn();
    const mkRes = () =>
      ({
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        setHeader: vi.fn(),
      }) as unknown as Response;

    mw(req, mkRes(), next);
    mw(req, mkRes(), next);
    expect(next).toHaveBeenCalledTimes(2);

    const res = mkRes();
    mw(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(2);
  });
});
