import { router } from "../trpc";
import { authRouter } from "./auth";
import { foodRouter } from "./food";
import { userRouter } from "./user";
import { themeRouter } from "./theme";

export const appRouter = router({
  auth: authRouter,
  food: foodRouter,
  user: userRouter,
  theme: themeRouter,
});

export type AppRouter = typeof appRouter;
