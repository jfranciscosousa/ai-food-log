import { z } from "zod";
import { completion } from "./aiutils";
import type { FitnessLevel, WeightLossGoal } from "~/generated/prisma/enums";

export const exerciseSchema = z.object({
  name: z.string().describe("Exercise name"),
  sets: z.number().optional().describe("Number of sets (strength only)"),
  reps: z.string().optional().describe("Reps per set, e.g. '8-12' or '10'"),
  duration: z
    .string()
    .optional()
    .describe("Duration for cardio/timed, e.g. '30 seconds', '5 minutes'"),
  restTime: z
    .string()
    .optional()
    .describe("Rest time between sets, e.g. '60 seconds', '2 minutes'"),
  instructions: z
    .string()
    .describe(
      "Step-by-step instructions on how to perform the exercise correctly",
    ),
  category: z
    .enum(["warmup", "strength", "cardio", "flexibility", "cooldown"])
    .describe("Exercise category"),
});

export type Exercise = z.infer<typeof exerciseSchema>;

export const workoutPlanSchema = z.object({
  name: z
    .string()
    .describe(
      "Short workout name, e.g. 'Upper Body Strength' or '30-min HIIT'",
    ),
  estimatedDuration: z.number().describe("Estimated total duration in minutes"),
  exercises: z.array(exerciseSchema),
});

export type WorkoutPlanAI = z.infer<typeof workoutPlanSchema>;

const fitnessLevelDescriptions: Record<FitnessLevel, string> = {
  SEDENTARY: "sedentary (little to no exercise)",
  LIGHTLY_ACTIVE: "lightly active (1-3 days/week)",
  MODERATELY_ACTIVE: "moderately active (3-5 days/week)",
  VERY_ACTIVE: "very active (6-7 days/week)",
  EXTRA_ACTIVE: "extra active (athlete level)",
};

const weightLossGoalDescriptions: Record<WeightLossGoal, string> = {
  MAINTAIN: "maintain current weight",
  LOW: "lose weight slowly (~0.25kg/week)",
  MEDIUM: "lose weight steadily (~0.5kg/week)",
  HIGH: "lose weight aggressively (~1kg/week)",
};

export async function generateWorkoutPlan(
  fitnessLevel: FitnessLevel,
  weightLossGoal: WeightLossGoal,
  workoutPreferences?: string | null,
  userPrompt?: string,
) {
  const defaultPrompt = "Suggest a balanced workout for today";
  const actualPrompt = userPrompt?.trim() || defaultPrompt;

  return completion(
    `
You are a personal trainer AI. Generate a workout plan tailored to the user's fitness level, goals, and available equipment.

Rules:
- Match the workout difficulty and volume to the user's fitness level
- ONLY use exercises that can be done with the user's available equipment and machines
- Respect the user's exercise preferences (e.g. injuries, dislikes, preferred style)
- Include a warm-up and cool-down
- For strength exercises always include sets, reps, and rest time between sets
- For cardio/timed exercises always include duration, no sets/reps
- Always include step-by-step instructions for every exercise
- If the user specifies a style in their request (e.g. "HIIT", "upper body"), follow it exactly
    `,
    {
      type: "string",
      content: `
User fitness level: ${fitnessLevelDescriptions[fitnessLevel]}
User goal: ${weightLossGoalDescriptions[weightLossGoal]}
${workoutPreferences ? `User preferences: ${workoutPreferences}` : ""}
User request: "${actualPrompt}"

Generate a workout plan for today.
      `,
    },
    workoutPlanSchema,
  );
}
