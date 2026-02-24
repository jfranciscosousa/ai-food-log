import { z } from "zod";
import { completion } from "./aiutils";
import { exerciseSchema } from "./generateWorkoutPlan.server";

const parsedWorkoutSchema = z.object({
  name: z
    .string()
    .describe(
      "Short workout name derived from the exercises listed, e.g. 'Upper Body Day' or 'Cardio & Core'",
    ),
  exercises: z.array(exerciseSchema),
});

export type ParsedWorkout = z.infer<typeof parsedWorkoutSchema>;

export async function parseWorkoutPlan(
  content: string,
): Promise<ParsedWorkout> {
  return completion(
    `
You are a fitness assistant that structures a user's workout description into a clean format.

Rules:
- Parse ONLY the exercises the user mentioned — do NOT add, suggest, or invent any extra exercises
- Classify each exercise into the correct category: warmup, strength, cardio, flexibility, or cooldown
- For strength exercises, extract sets and reps from the text (e.g. "3x10" → sets: 3, reps: "10")
- For cardio or timed exercises, extract the duration from the text (e.g. "20 min treadmill" → duration: "20 minutes")
- Add brief step-by-step form instructions for each exercise
- Derive a short descriptive name for the workout from the exercises listed
    `,
    {
      type: "string",
      content: `Structure this workout into the required format:\n\n"${content}"`,
    },
    parsedWorkoutSchema,
  );
}
