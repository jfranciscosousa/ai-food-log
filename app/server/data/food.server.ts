import { type FoodEntry } from "@prisma/client";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { processFoodWithAI } from "../ai/processFoodWithAI.server";
import prisma from "./prisma.server";
import { formatZodErrors } from "./utils/formatZodErrors.server";
import { type DataResult } from "./utils/types";
import { formatDate } from "~/hooks/useDates";

function getStartAndEndOfDay(day = formatDate(new Date())): [Date, Date] {
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0); // Set to start of the day

  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

  return [startOfDay, endOfDay];
}

async function getEntriesForDay(userId: string, date?: string) {
  const [start, end] = getStartAndEndOfDay(date);
  const entries = await prisma.foodEntry.findMany({
    include: { items: true },
    where: { userId, day: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
  });

  return entries;
}

async function getAggregateForDay(userId: string, date?: string) {
  const [start, end] = getStartAndEndOfDay(date);
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

export const createEntryParams = zfd.formData({
  content: zfd.text(),
  day: zfd.text(),
});

export type CreateEntryParams = z.infer<typeof createEntryParams> | FormData;

async function createEntry(
  userId: string,
  params: CreateEntryParams,
): Promise<DataResult<FoodEntry>> {
  const parsedSchema = createEntryParams.safeParse(params);

  if (!parsedSchema.success) {
    return { data: null, errors: formatZodErrors(parsedSchema.error) };
  }

  const aiResponse = await processFoodWithAI(parsedSchema.data.content);

  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.foodEntry.create({
      data: {
        ...parsedSchema.data,
        day: new Date(parsedSchema.data.day),
        userId,
        name: aiResponse.name,
        aiResponse,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
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

export const updateEntryParams = zfd.formData({
  id: zfd.text(),
  content: zfd.text(),
});

export type UpdateEntryParams = z.infer<typeof updateEntryParams> | FormData;

async function updateEntry(
  userId: string,
  params: UpdateEntryParams,
): Promise<DataResult<FoodEntry>> {
  const parsedSchema = updateEntryParams.safeParse(params);

  if (!parsedSchema.success) {
    return { data: null, errors: formatZodErrors(parsedSchema.error) };
  }

  const { id, content } = parsedSchema.data;

  const aiResponse = await processFoodWithAI(content);

  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.foodEntry.findUnique({ where: { id } });

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

export const deleteEntryParams = zfd.formData({
  id: zfd.text(),
});

export type DeleteEntryParams = z.infer<typeof deleteEntryParams> | FormData;

async function deleteEntry(userId: string, params: DeleteEntryParams) {
  const parsedSchema = deleteEntryParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const { id } = parsedSchema.data;

  await prisma.foodEntry.delete({
    where: { userId, id },
  });
}

export const deleteAllEntriesParams = zfd.formData({
  day: zfd.text(),
});

export type DeleteAllEntriesParams =
  | z.infer<typeof deleteAllEntriesParams>
  | FormData;

async function deleteAllEntries(
  userId: string,
  params: DeleteAllEntriesParams,
) {
  const parsedSchema = deleteAllEntriesParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const { day } = parsedSchema.data;

  const [start, end] = getStartAndEndOfDay(day);
  await prisma.foodEntry.deleteMany({
    where: { userId, day: { gte: start, lte: end } },
  });
}

const Food = {
  getEntriesForDay,
  getAggregateForDay,
  createEntry,
  updateEntry,
  deleteEntry,
  deleteAllEntries,
};

export default Food;
