import { z } from "zod";

export const getEntriesForDaySchema = z.object({
  date: z.string().optional(),
});

export const getAggregateForDaySchema = z.object({
  date: z.string().optional(),
});

export const createEntrySchema = z.object({
  content: z.string().optional(),
  imageBase64: z.string().optional(),
  day: z.string(),
});

export const updateEntrySchema = z.object({
  id: z.string(),
  content: z.string(),
});

export const deleteEntrySchema = z.object({
  id: z.string(),
});

export const deleteAllEntriesSchema = z.object({
  day: z.string(),
});

export const previewEntrySchema = z.object({
  input: z.string(),
});

export const generateMealSuggestionSchema = z.object({
  date: z.string(),
  prompt: z.string().optional(),
});
