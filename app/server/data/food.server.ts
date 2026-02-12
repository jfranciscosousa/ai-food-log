import { type FoodEntry } from "@prisma/client";
import { z } from "zod";
import { processFoodWithAI } from "../ai/processFoodWithAI.server";
import prisma from "./prisma.server";
import { formatZodErrors } from "./utils/formatZodErrors.server";
import { type DataResult } from "./utils/types";
import { formatDate } from "~/hooks/useDates";

export class FoodService {
  // Plain object schemas (for tRPC)
  static readonly createEntryParams = z.object({
    content: z.string().optional(),
    image: z.instanceof(File).optional(),
    day: z.string(),
  });

  static readonly updateEntryParams = z.object({
    id: z.string(),
    content: z.string(),
  });

  static readonly deleteEntryParams = z.object({
    id: z.string(),
  });

  static readonly deleteAllEntriesParams = z.object({
    day: z.string(),
  });

  private static getStartAndEndOfDay(
    day = formatDate(new Date()),
  ): [Date, Date] {
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0); // Set to start of the day

    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

    return [startOfDay, endOfDay];
  }

  static async getEntriesForDay(userId: string, date?: string) {
    const [start, end] = this.getStartAndEndOfDay(date);
    const entries = await prisma.foodEntry.findMany({
      include: { items: true },
      where: { userId, day: { gte: start, lte: end } },
      orderBy: { createdAt: "desc" },
    });

    return entries;
  }

  static async getAggregateForDay(userId: string, date?: string) {
    const [start, end] = this.getStartAndEndOfDay(date);
    const entries = await prisma.foodEntry.aggregate({
      _sum: {
        calories: true,
        carbs: true,
        fat: true,
        fiber: true,
        protein: true,
      },
      where: { userId, day: { gte: start, lte: end } },
    });

    return {
      calories: entries._sum.calories || 0,
      protein: entries._sum.protein || 0,
      carbs: entries._sum.carbs || 0,
      fat: entries._sum.fat || 0,
      fiber: entries._sum.fiber || 0,
    };
  }

  static async createEntry(
    userId: string,
    params: z.infer<typeof FoodService.createEntryParams> | FormData,
  ): Promise<DataResult<FoodEntry>> {
    const parsedSchema = this.createEntryParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    if (!(parsedSchema.data.content || parsedSchema.data.image)) {
      return {
        data: null,
        errors: { content: "required either content or image" },
      };
    }

    const aiResponse = await processFoodWithAI(
      parsedSchema.data.content! || parsedSchema.data.image!,
    );

    if (aiResponse.invalid) {
      return {
        data: null,
        errors: { content: "Prompt is not a valid meal description." },
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.foodEntry.create({
        data: {
          content: parsedSchema.data.content || "Generated from photo",
          day: new Date(parsedSchema.data.day),
          userId,
          name: aiResponse.name,
          aiResponse,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          fromImage: !!parsedSchema.data.image,
        },
      });

      await tx.foodEntryItem.createMany({
        data: aiResponse.items.map((item) => ({
          ...item,
          foodEntryId: entry.id,
        })),
      });

      const itemTotals = await tx.foodEntryItem.aggregate({
        _sum: {
          calories: true,
          carbs: true,
          fat: true,
          fiber: true,
          protein: true,
        },
        where: { foodEntryId: entry.id },
      });

      await tx.foodEntry.update({
        where: { id: entry.id },
        data: {
          calories: itemTotals._sum.calories || 0,
          carbs: itemTotals._sum.carbs || 0,
          fat: itemTotals._sum.fat || 0,
          fiber: itemTotals._sum.fiber || 0,
          protein: itemTotals._sum.protein || 0,
        },
      });

      return entry;
    });

    return { data: result, errors: null };
  }

  static async updateEntry(
    userId: string,
    params: z.infer<typeof FoodService.updateEntryParams> | FormData,
  ): Promise<DataResult<FoodEntry>> {
    const parsedSchema = this.updateEntryParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const { id, content } = parsedSchema.data;

    const aiResponse = await processFoodWithAI(content);

    if (aiResponse.invalid) {
      return {
        data: null,
        errors: { content: "Prompt is not a valid meal description." },
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.foodEntry.findUnique({ where: { id, userId } });

      if (!entry) return null;

      await tx.foodEntry.update({
        where: { id },
        data: {
          name: aiResponse.name,
          aiResponse,
          content,
        },
      });

      await tx.foodEntryItem.deleteMany({ where: { foodEntryId: entry.id } });

      await tx.foodEntryItem.createMany({
        data: aiResponse.items.map((item) => ({
          ...item,
          foodEntryId: entry.id,
        })),
      });

      const itemTotals = await tx.foodEntryItem.aggregate({
        _sum: {
          calories: true,
          carbs: true,
          fat: true,
          fiber: true,
          protein: true,
        },
        where: { foodEntryId: entry.id },
      });

      await tx.foodEntry.update({
        where: { id: entry.id },
        data: {
          calories: itemTotals._sum.calories || 0,
          carbs: itemTotals._sum.carbs || 0,
          fat: itemTotals._sum.fat || 0,
          fiber: itemTotals._sum.fiber || 0,
          protein: itemTotals._sum.protein || 0,
        },
      });

      return entry;
    });

    if (!result) {
      return { data: null, errors: { id: "Entry not found in the system." } };
    }

    return { data: result, errors: null };
  }

  static async deleteEntry(
    userId: string,
    params: z.infer<typeof FoodService.deleteEntryParams> | FormData,
  ): Promise<DataResult<FoodEntry>> {
    const parsedSchema = this.deleteEntryParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const { id } = parsedSchema.data;

    const deletedEntry = await prisma.foodEntry.delete({
      where: { userId, id },
    });

    return { data: deletedEntry, errors: null };
  }

  static async deleteAllEntries(
    userId: string,
    params: z.infer<typeof FoodService.deleteAllEntriesParams> | FormData,
  ): Promise<DataResult<{ count: number }>> {
    const parsedSchema = this.deleteAllEntriesParams.safeParse(params);

    if (!parsedSchema.success) {
      return { data: null, errors: formatZodErrors(parsedSchema.error) };
    }

    const { day } = parsedSchema.data;

    const [start, end] = this.getStartAndEndOfDay(day);
    const result = await prisma.foodEntry.deleteMany({
      where: { userId, day: { gte: start, lte: end } },
    });

    return { data: { count: result.count }, errors: null };
  }
}

export default FoodService;
