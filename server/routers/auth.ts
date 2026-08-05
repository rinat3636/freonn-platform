import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, directorProcedure, router } from "../_core/trpc";
import { createSessionToken, hashPassword, verifyPassword } from "../_core/auth";
import { getDbOrThrow, omitPassword } from "./_shared";
import { users } from "../../drizzle/schema";

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(["director", "foreman", "customer"]).optional(),
});

export const authRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDbOrThrow();
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return user ? omitPassword(user) : null;
  }),

  login: publicProcedure.input(loginInput).mutation(async ({ input }) => {
    const db = await getDbOrThrow();
    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный email или пароль" });
    }
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный email или пароль" });
    }
    const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
    return { user: omitPassword(user), token };
  }),

  register: publicProcedure.input(registerInput).mutation(async ({ input }) => {
    const db = await getDbOrThrow();
    const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (existing.length > 0) {
      throw new TRPCError({ code: "CONFLICT", message: "Email уже зарегистрирован" });
    }

    const countResult = await db.select({ count: count() }).from(users);
    const isFirst = countResult[0]?.count === 0;

    const passwordHash = await hashPassword(input.password);
    const role = isFirst ? "director" : (input.role ?? "customer");

    const result = await db.insert(users).values({
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      role,
    });
    const userId = Number(result[0]?.insertId);
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
    return { user: omitPassword(user), token };
  }),

  listUsers: directorProcedure.query(async () => {
    const db = await getDbOrThrow();
    const all = await db.select().from(users);
    return all.map(omitPassword);
  }),
});
