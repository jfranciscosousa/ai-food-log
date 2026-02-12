import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const setThemeInput = z.object({
  theme: z.enum(["dark", "light", "system"]),
});

export const themeRouter = router({
  setTheme: publicProcedure.input(setThemeInput).mutation(async ({ input }) => {
    // In CSR mode, we'll handle theme storage client-side
    return { success: true, theme: input.theme };
  }),
});
