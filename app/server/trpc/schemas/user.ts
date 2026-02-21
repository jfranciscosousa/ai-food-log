import {
  FitnessLevel,
  Gender,
  WeightLossGoal,
} from "~/generated/prisma/browser";
import { z } from "zod";

export const updateUserSchema = z.object({
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
  targetProtein: z.number().optional(),
  targetCarbs: z.number().optional(),
  targetFat: z.number().optional(),
  targetFiber: z.number().optional(),
});

export const updateHealthSchema = z.object({
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  age: z.number(),
  height: z.number(),
  weight: z.number(),
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
  targetCalories: z.number().optional().nullable(),
  targetProtein: z.number().optional(),
  targetCarbs: z.number().optional(),
  targetFat: z.number().optional(),
  targetFiber: z.number().optional(),
  workoutPreferences: z.string().optional().nullable(),
});

export const updateAccountSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  currentPassword: z.string(),
  newPassword: z.string().optional(),
  passwordConfirmation: z.string().optional(),
});
