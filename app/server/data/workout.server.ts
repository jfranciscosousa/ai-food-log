import { z } from "zod";
import prisma from "./prisma.server";
import { generateWorkoutPlan } from "../ai/generateWorkoutPlan.server";
import { parseWorkoutPlan } from "../ai/parseWorkoutPlan.server";
import type { FitnessLevel, WeightLossGoal } from "~/generated/prisma/enums";

function getStartAndEndOfDay(date?: string): [Date, Date] {
  const base = date ? new Date(date) : new Date();
  const start = new Date(base);
  start.setHours(0, 0, 0, 0);
  const end = new Date(base);
  end.setHours(23, 59, 59, 999);
  return [start, end];
}

export class WorkoutService {
  static async getPlanForDay(userId: string, date?: string) {
    const [start, end] = getStartAndEndOfDay(date);
    return prisma.workoutPlan.findFirst({
      where: { userId, day: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createManualPlan(
    userId: string,
    params: { content: string; day: string },
  ) {
    const { content, day } = params;
    const [start, end] = getStartAndEndOfDay(day);

    const parsed = await parseWorkoutPlan(content);

    await prisma.workoutPlan.deleteMany({
      where: { userId, day: { gte: start, lte: end } },
    });

    return prisma.workoutPlan.create({
      data: {
        userId,
        day: new Date(day),
        name: parsed.name,
        content,
        exercises: parsed.exercises,
        aiGenerated: false,
      },
    });
  }

  static async createAIPlan(
    userId: string,
    params: {
      day: string;
      prompt?: string;
      fitnessLevel: FitnessLevel;
      weightLossGoal: WeightLossGoal;
      workoutPreferences?: string | null;
    },
  ) {
    const { day, prompt, fitnessLevel, weightLossGoal, workoutPreferences } =
      params;
    const [start, end] = getStartAndEndOfDay(day);

    const aiResponse = await generateWorkoutPlan(
      fitnessLevel,
      weightLossGoal,
      workoutPreferences,
      prompt,
    );

    await prisma.workoutPlan.deleteMany({
      where: { userId, day: { gte: start, lte: end } },
    });

    return prisma.workoutPlan.create({
      data: {
        userId,
        day: new Date(day),
        name: aiResponse.name,
        content: prompt ?? "AI Generated",
        exercises: aiResponse.exercises,
        aiGenerated: true,
      },
    });
  }

  static deletePlan(userId: string, id: string) {
    return prisma.workoutPlan.delete({ where: { id, userId } });
  }
}

export const createManualPlanSchema = z.object({
  content: z.string().min(1),
  day: z.string(),
});

export const createAIPlanSchema = z.object({
  day: z.string(),
  prompt: z.string().optional(),
});

export const deletePlanSchema = z.object({ id: z.string() });
