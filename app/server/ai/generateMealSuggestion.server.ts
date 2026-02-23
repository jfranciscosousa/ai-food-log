import { z } from "zod";
import { completion } from "./aiutils";
import { generateMealSuggestionMock } from "./generateMealSuggestion.mock";
import { SERVER_ENV } from "~/env.server";

interface RemainingMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export async function generateMealSuggestion(
  remaining: RemainingMacros,
  userPrompt?: string,
) {
  // Use mock in test environment
  if (SERVER_ENV.USE_AI_MOCK) {
    return generateMealSuggestionMock(remaining, userPrompt);
  }

  const { calories, protein, carbs, fat, fiber } = remaining;

  const defaultPrompt =
    "Suggest a balanced meal to help me meet my remaining daily goals";
  const actualPrompt = userPrompt || defaultPrompt;

  return completion(
    `
    You are a helpful nutritionist AI assistant. Your role is to suggest meal ideas based on the user's request and their remaining daily nutrition goals.

    KEY INSTRUCTIONS - READ CAREFULLY:
    1. ALWAYS suggest actual meals with specific ingredients and weights. NEVER return text like "no food needed" or "goals met" - you MUST suggest real food.
    2. FOLLOW THE USER'S INSTRUCTIONS EXACTLY. If they ask for lunch, suggest a lunch. If they ask for 3 meals, suggest 3 meals.
    3. BE REALISTIC AND PRACTICAL:
       - For a single meal request (e.g., "what can I have for lunch?"): Suggest ONE balanced meal at a reasonable portion size for that meal type. DO NOT try to use up all remaining macros - a lunch should be lunch-sized, even if there are 2000 calories remaining.
       - For multiple meals (e.g., "plan 3 meals" or "full day"): Distribute the remaining macros ACROSS all meals. Each meal should be appropriately sized (breakfast smaller, dinner larger, etc.)
       - If remaining macros are low or negative: Still suggest meals at appropriate portion sizes for the meal type requested. The user still wants food suggestions.
    4. USE AVAILABLE INGREDIENTS: If the user mentions ingredients they have (e.g., "I have chicken and rice"), incorporate those into your suggestion.
    5. FORMAT REQUIREMENTS:
       - Each meal MUST be a natural language description with specific foods and weights in grams
       - Example: "150g grilled chicken breast, 200g cooked brown rice, 100g steamed broccoli"
       - DO NOT include macros, calories, or nutrition info in descriptions
       - DO NOT include explanatory text like "this will help you..." or "you need..."
       - ONLY food items with weights

    Portion size context:
    - Breakfast: typically 300-500 calories (e.g., 80g oats, 200ml milk, 100g berries)
    - Lunch: typically 400-600 calories (e.g., 150g chicken, 200g rice, vegetables)
    - Dinner: typically 500-800 calories (e.g., 200g salmon, 250g potatoes, vegetables)
    - Snack: typically 100-300 calories (e.g., 30g almonds, 100g yogurt)

    Always specify weights in grams for each component and account for cooking methods (raw vs cooked).
    `,
    {
      type: "string",
      content: `
    User's remaining daily macros:
    - Calories: ${Math.max(0, calories)} kcal
    - Protein: ${Math.max(0, protein)}g
    - Carbs: ${Math.max(0, carbs)}g
    - Fat: ${Math.max(0, fat)}g
    - Fiber: ${Math.max(0, fiber)}g

    User's request: "${actualPrompt}"

    Provide meal suggestions that match their request. Remember: ALWAYS return actual food descriptions with weights, never explanatory text.
    `,
    },
    z.object({
      meals: z
        .array(
          z.object({
            description: z
              .string()
              .describe(
                "Natural language meal description with specific weights in grams. Format: '150g grilled chicken breast, 200g cooked brown rice, 100g steamed broccoli'. Do NOT include macros.",
              ),
          }),
        )
        .describe(
          "Array of meal suggestions. If user asks for one meal (e.g., 'lunch'), return 1 meal. If they ask for 'plan the entire day' or '3 meals', return multiple meals that together meet the remaining goals.",
        ),
    }),
  );
}
