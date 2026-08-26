import { COOKIE_NAME } from "@shared/const";
import { experimentRunInput } from "@shared/experiments";
import { createExperimentRun, listExperimentRuns } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  experiments: router({
    list: protectedProcedure.query(async ({ ctx }) => listExperimentRuns(ctx.user.id)),
    exportAll: protectedProcedure.mutation(async ({ ctx }) => listExperimentRuns(ctx.user.id)),
    save: protectedProcedure.input(experimentRunInput).mutation(async ({ ctx, input }) => {
      await createExperimentRun({ ...input, userId: ctx.user.id });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
