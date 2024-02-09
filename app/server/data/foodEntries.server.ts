import { zfd } from "zod-form-data";
import prisma from "./prisma.server";
import { FoodEntry } from "@prisma/client";
import { DataResult } from "./utils/types";
import { z } from "zod";
import { formatZodErrors } from "./utils/formatZodErrors.server";
import { completion } from "./openai.server";

function getStartAndEndOfDay(date = new Date()): [Date, Date] {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0); // Set to start of the day

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

  return [startOfDay, endOfDay];
}

export async function getEntriesForDay(userId: string, date = new Date()) {
  const [start, end] = getStartAndEndOfDay(date);
  const entries = await prisma.foodEntry.findMany({
    include: { items: true },
    where: { userId, day: { gte: start, lte: end } },
  });

  return entries;
}

export async function getAggregateEntriesForDay(
  userId: string,
  date = new Date(),
) {
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

export async function createEntry(
  userId: string,
  params: CreateEntryParams,
): Promise<DataResult<FoodEntry>> {
  const parsedSchema = createEntryParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const response = await completion(
    `Convert the following prompt into a meal structure with this schema: ${parsedSchema.data.content}.

    Some considerations:
    - if the user specifies raw or uncooked, please make sure you represent those values diferently. Raw or uncooked food usually doesn't account
    for water weight lost during cooking time so please adjust.
    - if the user specifies the macros, please calculate the calories from it. for example user might say "whey protein shake with 50g calories and 20g carbs"
    you should fill in the calories for this item
    `,
    {
      schema: z.object({
        name: z.string().describe("A short name that describes the meal"),
        items: z.array(
          z
            .object({
              name: z
                .string()
                .describe("A short name that describes the ingredient"),
              servingSize: z
                .number()
                .describe(
                  "The total weight of this component (default to grams ALWAYS performing a conversion if needed)",
                ),
              calories: z.number().describe("Caloric content of the meal"),
              protein: z
                .number()
                .describe("Protein content of the meal in grams"),
              carbs: z.number().describe("Carb content of the meal in grams"),
              fat: z.number().describe("Fat content of the meal in grams"),
              fiber: z.number().describe("Fiber content of the meal in grams"),
            })
            .describe("Each of the individual components of this meal"),
        ),
      }),
    },
  );

  const result = await prisma.$transaction(async (tx) => {
    const entry = await tx.foodEntry.create({
      data: {
        ...parsedSchema.data,
        userId,
        name: response.data.name,
        aiResponse: response.data,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      },
    });

    await tx.foodEntryItem.createMany({
      data: response.data.items.map((item) => ({
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

export const deleteEntryParams = zfd.formData({
  id: zfd.text(),
});

export type DeleteEntryParams = z.infer<typeof deleteEntryParams> | FormData;

export async function deleteEntry(userId: string, params: DeleteEntryParams) {
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

export async function deleteAllEntries(
  userId: string,
  params: DeleteAllEntriesParams,
) {
  const parsedSchema = deleteAllEntriesParams.safeParse(params);

  if (!parsedSchema.success)
    return { data: null, errors: formatZodErrors(parsedSchema.error) };

  const { day } = parsedSchema.data;

  const [start, end] = getStartAndEndOfDay(new Date(day));
  await prisma.foodEntry.deleteMany({
    where: { userId, day: { gte: start, lte: end } },
  });
}
