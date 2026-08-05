import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookie } from "cookie";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { COOKIE_NAME, verifySessionToken } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: Awaited<ReturnType<typeof resolveUser>>;
};

async function resolveUser(req: CreateExpressContextOptions["req"]) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookies = parseCookie(req.headers.cookie ?? "");
    token = cookies[COOKIE_NAME];
  }

  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const db = await getDb();
  if (!db) return null;

  const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
  return user ?? null;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await resolveUser(opts.req);
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
