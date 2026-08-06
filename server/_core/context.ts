import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { resolveUserFromRequest } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: Awaited<ReturnType<typeof resolveUserFromRequest>>;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const user = await resolveUserFromRequest(opts.req);
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
