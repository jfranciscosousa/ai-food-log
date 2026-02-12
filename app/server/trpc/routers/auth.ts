import { FitnessLevel, Gender, WeightLossGoal } from "@prisma/client";
import { z } from "zod";
import { authenticate, logout, userFromRequest } from "../../auth.server";
import { UsersService } from "../../data/users.server";
import { publicProcedure, router } from "../trpc";
import { createValidationError } from "../errors";

// Convert FormData schemas to plain object schemas
const loginInput = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

const signupInput = z.object({
  inviteToken: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
  passwordConfirmation: z.string(),
  age: z.number(),
  height: z.number(),
  weight: z.number(),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  fitnessLevel: z.enum([
    FitnessLevel.EXTRA_ACTIVE,
    FitnessLevel.LIGHTLY_ACTIVE,
    FitnessLevel.MODERATELY_ACTIVE,
    FitnessLevel.SEDENTARY,
    FitnessLevel.VERY_ACTIVE,
  ]),
  weightLossGoal: z.enum([
    WeightLossGoal.MAINTAIN,
    WeightLossGoal.LOW,
    WeightLossGoal.MEDIUM,
    WeightLossGoal.HIGH,
  ]),
  rememberMe: z.boolean().optional(),
});

export const authRouter = router({
  login: publicProcedure.input(loginInput).mutation(async ({ input, ctx }) => {
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
    .input(signupInput)
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
