import { useMemo } from "react";
import { CLIENT_ENV, type ClientEnv } from "~/env";
import type { UserFeatureFlags } from "~/server/data/users/userFeatureFlags.server";
import { useOptionalUser } from "./useUser";

export default function useFeatureFlags() {
  const user = useOptionalUser();

  return useMemo(
    () => ({
      // Check the CLIENT_ENV object for feature flags
      hasGlobalFeatureFlag: (flag: keyof ClientEnv): boolean =>
        !!CLIENT_ENV[flag],
      // Check the current user feature flags. If there's no user, this returns false, always
      hasUserFeatureFlag: (flag: keyof UserFeatureFlags): boolean =>
        !!user?.featureFlags?.[flag],
    }),
    [user?.featureFlags],
  );
}
