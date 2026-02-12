import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { UsersService } from "../../data/users.server";
import { FitnessLevel, Gender, WeightLossGoal } from "@prisma/client";
import { createValidationError } from "../errors";

const updateUserInput = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
  currentPassword: z.string(),
  newPassword: z.string().optional(),
  passwordConfirmation: z.string().optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  age: z.number().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  fitnessLevel: z
    .enum([
      FitnessLevel.EXTRA_ACTIVE,
      FitnessLevel.LIGHTLY_ACTIVE,
      FitnessLevel.MODERATELY_ACTIVE,
      FitnessLevel.SEDENTARY,
      FitnessLevel.VERY_ACTIVE,
    ])
    .optional(),
  weightLossGoal: z
    .enum([
      WeightLossGoal.MAINTAIN,
      WeightLossGoal.LOW,
      WeightLossGoal.MEDIUM,
      WeightLossGoal.HIGH,
    ])
    .optional(),
});

export const userRouter = router({
  update: protectedProcedure
    .input(updateUserInput)
    .mutation(async ({ ctx, input }) => {
      const result = await UsersService.update(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to update profile", result.errors);
      }

      return result.data;
    }),
});
