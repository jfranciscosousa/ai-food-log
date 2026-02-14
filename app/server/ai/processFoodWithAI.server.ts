import { z } from "zod";
import { completion, type Prompt } from "./openai.server";

export async function processFoodWithAI(prompt: Prompt) {
  return completion(
    `
    You are a meal tracker helper. You convert human text, like descriptions of meals with weights and convert it into macros.

    Convert the following prompt into a meal structure.

    Some considerations:
    - if the user specifies raw or uncooked, please make sure you represent those values diferently. Raw or uncooked food usually doesn't account
    for water weight lost during cooking time so please adjust.
    - if the user specifies the macros like protein fat carbs fiber, please calculate the calories from it. for example user might say "whey protein shake with 50g calories and 20g carbs"
    you should fill in the calories for this item. don't even bother looking for ingredients, just return the macros
    `,
    prompt,
    z.object({
      name: z.string().describe("A short name that describes the meal"),
      icon: z
        .string()
        .describe(
          "A lucide-react icon name (in PascalCase) that best represents this meal or time of day. Examples: Coffee (morning coffee), Pizza (pizza meal), Apple (fruit/healthy), Beef (meat), Croissant (breakfast), Moon (late night snack), Sun (breakfast), Sunset (dinner), Cookie (dessert), Salad (salad), Drumstick (chicken), Fish, Milk, Egg, Cake, IceCream, Wine, Beer, Soup, Sandwich, Popcorn, Cherry",
        ),
      invalid: z
        .boolean()
        .describe(
          "If the prompt is not a valid specification, set this as true otherwise set it as false",
        ),
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
  );
}
