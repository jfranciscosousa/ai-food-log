import { router } from "../trpc";
import { authRouter } from "./auth";
import { foodRouter } from "./food";
import { userRouter } from "./user";
import { themeRouter } from "./theme";
import { workoutRouter } from "./workout";

export const appRouter = router({
  auth: authRouter,
  food: foodRouter,
  user: userRouter,
  theme: themeRouter,
  workout: workoutRouter,
});

export type AppRouter = typeof appRouter;
