import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { FoodService } from "../../data/food.server";
import { processFoodWithAI } from "../../ai/processFoodWithAI.server";

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
        day: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.createEntry(ctx.userId, input);

      if (result.errors) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create entry",
          cause: result.errors,
        });
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
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to update entry",
          cause: result.errors,
        });
      }

      return result.data;
    }),

  deleteEntry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteEntry(ctx.userId, input);

      if (result.errors) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to delete entry",
          cause: result.errors,
        });
      }

      return result.data;
    }),

  deleteAllEntries: protectedProcedure
    .input(z.object({ day: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await FoodService.deleteAllEntries(ctx.userId, input);

      if (result.errors) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to delete entries",
          cause: result.errors,
        });
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
});
