import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { FoodService } from "../../data/food.server";
import { processFoodWithAI } from "../../ai/processFoodWithAI.server";
import { generateMealSuggestion } from "../../ai/generateMealSuggestion.server";
import { createValidationError } from "../errors";
import prisma from "../../data/prisma.server";

export const foodRouter = router({
  getEntriesForDay: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return FoodService.getEntriesForDay(ctx.userId, input.date);
    }),

  getAggregateForDay: protectedProcedure
    .input(z.object({ date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return FoodService.getAggregateForDay(ctx.userId, input.date);
    }),

  createEntry: protectedProcedure
    .input(
      z.object({
        content: z.string().optional(),
        imageBase64: z.string().optional(),
        day: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.createEntry(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to create entry", result.errors);
      }

      return result.data;
    }),

  updateEntry: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.updateEntry(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to update entry", result.errors);
      }

      return result.data;
    }),

  deleteEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteEntry(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to delete entry", result.errors);
      }

      return result.data;
    }),

  deleteAllEntries: protectedProcedure
    .input(z.object({ day: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteAllEntries(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to delete entries", result.errors);
      }

      return result.data;
    }),

  previewEntry: protectedProcedure
    .input(z.object({ input: z.string() }))
    .query(async ({ input }) => {
      const entry = await processFoodWithAI(input.input);

      if (entry.invalid) {
        return {
          success: false as const,
          error: "Invalid prompt",
          input: input.input,
        };
      }

      const totals = {
        calories: entry.items.reduce((acc, item) => acc + item.calories, 0),
        protein: entry.items.reduce((acc, item) => acc + item.protein, 0),
        carbs: entry.items.reduce((acc, item) => acc + item.carbs, 0),
        fat: entry.items.reduce((acc, item) => acc + item.fat, 0),
        fiber: entry.items.reduce((acc, item) => acc + item.fiber, 0),
      };

      return {
        ...entry,
        success: true as const,
        totals,
        input: input.input,
      };
    }),

  generateMealSuggestion: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        prompt: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: {
          targetCalories: true,
          targetProtein: true,
          targetCarbs: true,
          targetFat: true,
          targetFiber: true,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const totals = await FoodService.getAggregateForDay(
        ctx.userId,
        input.date,
      );

      const currentTotals = totals ?? {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      };

      const remaining = {
        calories: (user.targetCalories ?? 0) - currentTotals.calories,
        protein: (user.targetProtein ?? 0) - currentTotals.protein,
        carbs: (user.targetCarbs ?? 0) - currentTotals.carbs,
        fat: (user.targetFat ?? 0) - currentTotals.fat,
        fiber: (user.targetFiber ?? 0) - currentTotals.fiber,
      };

      const result = await generateMealSuggestion(remaining, input.prompt);

      return result;
    }),
});
