import {
  FitnessLevel,
  Gender,
  WeightLossGoal,
} from "~/generated/prisma/browser";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

export const signupSchema = z.object({
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
  targetCalories: z.number().optional().nullable(),
  rememberMe: z.boolean().optional(),
});
