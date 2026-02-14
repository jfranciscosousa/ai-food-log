import { z } from "zod";

export const setThemeSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
});
