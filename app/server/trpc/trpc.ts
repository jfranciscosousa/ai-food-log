import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { type Context } from "./context";
import { extractZodErrors } from "./errors";
import type { ZodError } from "zod";

function extractValidationErrors(error: TRPCError) {
  if (!error.cause) return;

  if (typeof error.cause !== "object") return;

  if ("validationErrors" in error.cause) return error.cause.validationErrors;

  if ("issues" in error.cause)
    return extractZodErrors(error.cause as ZodError<unknown>);

  return;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        validationErrors: extractValidationErrors(error),
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});
