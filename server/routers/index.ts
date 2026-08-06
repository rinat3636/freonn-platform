import { router } from "../_core/trpc";
import { authRouter } from "./auth";
import { camerasRouter } from "./cameras";
import { contentRouter } from "./content";
import { leadsRouter } from "./leads";
import { projectsRouter } from "./projects";
import { reportsRouter } from "./reports";
import { stagesRouter } from "./stages";

export const appRouter = router({
  auth: authRouter,
  projects: projectsRouter,
  stages: stagesRouter,
  content: contentRouter,
  cameras: camerasRouter,
  reports: reportsRouter,
  leads: leadsRouter,
});

export type AppRouter = typeof appRouter;
