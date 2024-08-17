import { z } from "zod";
import { completion } from "./openai.server";

export async function processFoodWithAI(content: string) {
  const response = await completion(
    `Convert the following prompt into a meal structure with this schema: ${content}.

    Some considerations:
    - if the user specifies raw or uncooked, please make sure you represent those values diferently. Raw or uncooked food usually doesn't account
    for water weight lost during cooking time so please adjust.
    - if the user specifies the macros like protein fat carbs fiber, please calculate the calories from it. for example user might say "whey protein shake with 50g calories and 20g carbs"
    you should fill in the calories for this item. don't even bother looking for ingredients, just return the macros
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

  return response.data;
}
