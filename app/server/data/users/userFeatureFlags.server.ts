import { z } from "zod/v4";

export const UserFeatureFlagsSchema = z
  .object({
    EXAMPLE_FEATURE_FLAG: z.boolean().optional(),
  })
  .default({});

export type UserFeatureFlags = z.infer<typeof UserFeatureFlagsSchema>;
