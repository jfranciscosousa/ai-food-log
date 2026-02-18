import { serializeThemeCookie } from "../../theme.server";
import { router, publicProcedure } from "../trpc";
import { setThemeSchema } from "../schemas/theme";

export const themeRouter = router({
  setTheme: publicProcedure
    .input(setThemeSchema)
    .mutation(async ({ input, ctx }) => {
      ctx.resHeaders.append(
        "Set-Cookie",
        await serializeThemeCookie(input.theme),
      );
      return { theme: input.theme };
    }),
});
