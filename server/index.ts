import { router } from "./trpc";
import { dltRouter } from "./routes/dltRoute";
import { ssqRouter } from "./routes/ssqRoute";

export const appRouter = router({
  dlt: dltRouter,
  ssq: ssqRouter,
});

export type AppRouter = typeof appRouter;
