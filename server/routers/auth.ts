import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  publicProcedure,
  protectedProcedure,
  directorProcedure,
  router,
} from "../_core/trpc";
import {
  createSessionToken,
  hashPassword,
  verifyPassword,
} from "../_core/auth";
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
});

export const authRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDbOrThrow();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    return user ? omitPassword(user) : null;
  }),

  login: publicProcedure.input(loginInput).mutation(async ({ input }) => {
    const db = await getDbOrThrow();
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Неверный email или пароль",
      });
    }
    if (!user.isActive) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Учётная запись отключена",
      });
    }
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Неверный email или пароль",
      });
    }
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: omitPassword(user), token };
  }),

  register: publicProcedure.input(registerInput).mutation(async ({ input }) => {
    const db = await getDbOrThrow();
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email уже зарегистрирован",
      });
    }

    const countResult = await db.select({ count: count() }).from(users);
    const isFirst = countResult[0]?.count === 0;

    const passwordHash = await hashPassword(input.password);
    const role = isFirst ? "director" : "customer";

    const result = await db.insert(users).values({
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      role,
    });
    const userId = Number(result[0]?.insertId);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: omitPassword(user), token };
  }),

  createUser: directorProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().optional(),
        role: z.enum(["customer", "foreman"]),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDbOrThrow();
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email уже зарегистрирован",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        role: input.role,
        passwordHash,
      });
      const userId = Number(result[0]?.insertId);
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      return omitPassword(user);
    }),

  listUsers: directorProcedure.query(async () => {
    const db = await getDbOrThrow();
    const all = await db.select().from(users);
    return all.map(omitPassword);
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        phone: z.string().max(20).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      const values: Partial<typeof users.$inferInsert> = { name: input.name };
      if (input.phone !== undefined) values.phone = input.phone;
      await db.update(users).set(values).where(eq(users.id, ctx.user.id));
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      return omitPassword(user);
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);
      if (!user || !(await verifyPassword(input.currentPassword, user.passwordHash))) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Текущий пароль указан неверно",
        });
      }
      await db
        .update(users)
        .set({ passwordHash: await hashPassword(input.newPassword) })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  updateUser: directorProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(2),
        phone: z.string().max(20).nullable().optional(),
        role: z.enum(["director", "foreman", "customer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      const [target] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }
      if (target.id === ctx.user.id && target.role !== input.role) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нельзя изменить собственную роль",
        });
      }
      await db
        .update(users)
        .set({ name: input.name, phone: input.phone, role: input.role })
        .where(eq(users.id, input.id));
      const [updated] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      return omitPassword(updated);
    }),

  setUserActive: directorProcedure
    .input(
      z.object({
        id: z.number().int(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Нельзя отключить собственную учётную запись",
        });
      }
      const db = await getDbOrThrow();
      const [target] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }
      await db
        .update(users)
        .set({ isActive: input.isActive })
        .where(eq(users.id, input.id));
      return { success: true };
    }),

  resetUserPassword: directorProcedure
    .input(
      z.object({
        id: z.number().int(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Собственный пароль можно изменить в профиле",
        });
      }
      const db = await getDbOrThrow();
      const [target] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Пользователь не найден",
        });
      }
      await db
        .update(users)
        .set({ passwordHash: await hashPassword(input.password) })
        .where(eq(users.id, input.id));
      return { success: true };
    }),
});
