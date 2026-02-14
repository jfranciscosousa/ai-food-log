import { authenticate, logout, userFromRequest } from "../../auth.server";
import { UsersService } from "../../data/users.server";
import { publicProcedure, router } from "../trpc";
import { createValidationError } from "../errors";
import { loginSchema, signupSchema } from "../schemas/auth";

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const result = await UsersService.login(input);

    if (result.errors) {
      throw createValidationError("Invalid credentials", result.errors);
    }

    await authenticate(result.data, ctx.resHeaders, {
      rememberMe: input.rememberMe,
    });

    return { user: result.data, success: true };
  }),

  signup: publicProcedure
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await UsersService.create(input);

      if (result.errors) {
        throw createValidationError("Signup failed", result.errors);
      }

      await authenticate(result.data, ctx.resHeaders, {
        rememberMe: input.rememberMe,
      });

      return { user: result.data, success: true };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await logout(ctx.resHeaders);

    return { success: true };
  }),

  me: publicProcedure.query(({ ctx }) => userFromRequest(ctx.req)),
});
