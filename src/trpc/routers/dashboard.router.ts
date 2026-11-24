import { createTRPCRouter, orgProcedure } from "../init";
import * as dashboardService from "@/server/services/dashboard.service";

export const dashboardRouter = createTRPCRouter({
  overview: orgProcedure.query(({ ctx }) => dashboardService.overview(ctx)),
});
