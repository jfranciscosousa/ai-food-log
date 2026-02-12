import type { TRPCClientErrorLike } from "@trpc/client";
import type { InferrableClientTypes } from "@trpc/server/unstable-core-do-not-import";

export function extractTrpcFormErrors<T extends InferrableClientTypes>(
  trpcError?: TRPCClientErrorLike<T> | null,
): Record<string, string> {
  const errorData = trpcError?.data;

  if (!errorData) return {};

  if (!("cause" in errorData)) return {};

  return errorData.cause as Record<string, string>;
}
