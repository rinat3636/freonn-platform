import { router } from "../_core/trpc";
import { authRouter } from "./auth";
import { camerasRouter } from "./cameras";
import { contentRouter } from "./content";
import { projectsRouter } from "./projects";
import { stagesRouter } from "./stages";

export const appRouter = router({
  auth: authRouter,
  projects: projectsRouter,
  stages: stagesRouter,
  content: contentRouter,
  cameras: camerasRouter,
});

export type AppRouter = typeof appRouter;
