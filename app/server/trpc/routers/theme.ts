import { router, publicProcedure } from "../trpc";
import { setThemeSchema } from "../schemas/theme";

export const themeRouter = router({
  setTheme: publicProcedure
    .input(setThemeSchema)
    .mutation(async ({ input }) => {
      // In CSR mode, we'll handle theme storage client-side
      return { success: true, theme: input.theme };
    }),
});
