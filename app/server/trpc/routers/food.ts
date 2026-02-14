import { router, protectedProcedure } from "../trpc";
import { FoodService } from "../../data/food.server";
import { processFoodWithAI } from "../../ai/processFoodWithAI.server";
import { generateMealSuggestion } from "../../ai/generateMealSuggestion.server";
import { createValidationError } from "../errors";
import prisma from "../../data/prisma.server";
import {
  getEntriesForDaySchema,
  getAggregateForDaySchema,
  createEntrySchema,
  updateEntrySchema,
  deleteEntrySchema,
  deleteAllEntriesSchema,
  previewEntrySchema,
  generateMealSuggestionSchema,
} from "../schemas/food";

export const foodRouter = router({
  getEntriesForDay: protectedProcedure
    .input(getEntriesForDaySchema)
    .query(async ({ ctx, input }) => {
      return FoodService.getEntriesForDay(ctx.userId, input.date);
    }),

  getAggregateForDay: protectedProcedure
    .input(getAggregateForDaySchema)
    .query(async ({ ctx, input }) => {
      return FoodService.getAggregateForDay(ctx.userId, input.date);
    }),

  createEntry: protectedProcedure
    .input(createEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.createEntry(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to create entry", result.errors);
      }

      return result.data;
    }),

  updateEntry: protectedProcedure
    .input(updateEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.updateEntry(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to update entry", result.errors);
      }

      return result.data;
    }),

  deleteEntry: protectedProcedure
    .input(deleteEntrySchema)
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteEntry(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to delete entry", result.errors);
      }

      return result.data;
    }),

  deleteAllEntries: protectedProcedure
    .input(deleteAllEntriesSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteAllEntries(ctx.userId, input);

      if (result.errors) {
        throw createValidationError("Failed to delete entries", result.errors);
      }

      return result.data;
    }),

  previewEntry: protectedProcedure
    .input(previewEntrySchema)
    .query(async ({ input }) => {
      const entry = await processFoodWithAI({
        type: "string",
        content: input.input,
      });

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
    .input(generateMealSuggestionSchema)
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
