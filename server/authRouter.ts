import { router, publicProcedure } from "./_core/trpc";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

/**
 * Заглушка под клиентский `useAuth`: полноценный auth можно подключить позже.
 * Сейчас даёт корректные типы tRPC и предсказуемое поведение дашборда.
 */
export const authRouter = router({
  me: publicProcedure.query((): AuthUser | null => null),
  logout: publicProcedure.mutation(() => undefined),
});
