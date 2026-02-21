import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { WorkoutService } from "../../data/workout.server";
import prisma from "../../data/prisma.server";
import { protectedProcedure, router } from "../trpc";

export const workoutRouter = router({
  getPlanForDay: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(({ ctx, input }) =>
      WorkoutService.getPlanForDay(ctx.userId, input.date),
    ),

  createManualPlan: protectedProcedure
    .input(z.object({ content: z.string().min(1), day: z.string() }))
    .mutation(({ ctx, input }) =>
      WorkoutService.createManualPlan(ctx.userId, input),
    ),

  generateAIPlan: protectedProcedure
    .input(z.object({ day: z.string(), prompt: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: {
          fitnessLevel: true,
          weightLossGoal: true,
          workoutPreferences: true,
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return WorkoutService.createAIPlan(ctx.userId, {
        ...input,
        fitnessLevel: user.fitnessLevel,
        weightLossGoal: user.weightLossGoal,
        workoutPreferences: user.workoutPreferences,
      });
    }),

  deletePlan: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      WorkoutService.deletePlan(ctx.userId, input.id),
    ),
});
