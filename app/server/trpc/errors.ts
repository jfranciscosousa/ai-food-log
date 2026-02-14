import type { TRPCClientErrorLike } from "@trpc/client";
import type { InferrableClientTypes } from "@trpc/server/unstable-core-do-not-import";
import { TRPCError } from "@trpc/server";
import type { ZodError } from "zod";

export function createValidationError(
  message: string,
  validationErrors: Record<string, string>,
) {
  return new TRPCError({
    code: "BAD_REQUEST",
    message,
    cause: { validationErrors },
  });
}

export function extractTrpcFormErrors<T extends InferrableClientTypes>(
  trpcError?: TRPCClientErrorLike<T> | null,
): Record<string, string> {
  const errorData = trpcError?.data;

  if (!errorData) return {};

  // Check for Zod validation errors first
  if ("zodError" in errorData && errorData.zodError) {
    const zodError = errorData.zodError as {
      fieldErrors?: Record<string, string[]>;
    };
    if (zodError.fieldErrors) {
      // Convert Zod's array format to single string per field
      return Object.fromEntries(
        Object.entries(zodError.fieldErrors).map(([key, messages]) => [
          key,
          Array.isArray(messages) ? messages[0] : messages,
        ]),
      );
    }
  }

  // Check for custom validation errors
  if ("validationErrors" in errorData && errorData.validationErrors) {
    return errorData.validationErrors as Record<string, string>;
  }

  return {};
}

export function extractZodClientErrors(error: ZodError<unknown>) {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return errors;
}
