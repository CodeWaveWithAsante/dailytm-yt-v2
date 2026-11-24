import { createTRPCRouter } from "../init";
import { orgRouter } from "./org.router";
import { projectRouter } from "./project.router";
import { taskRouter } from "./task.router";
import { workflowStatusRouter } from "./workflow.router";
import { dashboardRouter } from "./dashboard.router";

export const appRouter = createTRPCRouter({
  project: projectRouter,
  task: taskRouter,
  workflow: workflowStatusRouter,
  org: orgRouter,
  dashboard: dashboardRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
