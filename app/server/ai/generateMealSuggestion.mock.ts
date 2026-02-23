interface RemainingMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

/**
 * Mock meal suggestion generator for testing
 * Returns deterministic meal suggestions
 */
export async function generateMealSuggestionMock(
  remaining: RemainingMacros,
  userPrompt?: string,
) {
  const prompt = (userPrompt || "").toLowerCase();

  // Pattern matching for different meal requests
  if (prompt.includes("breakfast")) {
    return {
      meals: [
        {
          description:
            "80g rolled oats, 200ml whole milk, 100g mixed berries, 15g honey",
        },
      ],
    };
  }

  if (prompt.includes("lunch")) {
    return {
      meals: [
        {
          description:
            "150g grilled chicken breast, 200g cooked brown rice, 100g steamed broccoli, 50g cherry tomatoes",
        },
      ],
    };
  }

  if (prompt.includes("dinner")) {
    return {
      meals: [
        {
          description:
            "200g baked salmon, 250g roasted sweet potato, 150g green beans, 10ml olive oil",
        },
      ],
    };
  }

  if (prompt.includes("snack")) {
    return {
      meals: [
        {
          description: "30g almonds, 150g Greek yogurt, 50g blueberries",
        },
      ],
    };
  }

  if (
    prompt.includes("3 meals") ||
    prompt.includes("plan") ||
    prompt.includes("entire day") ||
    prompt.includes("full day")
  ) {
    return {
      meals: [
        {
          description:
            "80g rolled oats, 200ml whole milk, 100g mixed berries, 15g honey",
        },
        {
          description:
            "150g grilled chicken breast, 200g cooked brown rice, 100g steamed broccoli, 50g cherry tomatoes",
        },
        {
          description:
            "200g baked salmon, 250g roasted sweet potato, 150g green beans, 10ml olive oil",
        },
      ],
    };
  }

  if (prompt.includes("high protein") || prompt.includes("protein")) {
    return {
      meals: [
        {
          description:
            "200g grilled chicken breast, 150g cottage cheese, 100g edamame, 50g spinach",
        },
      ],
    };
  }

  if (prompt.includes("vegetarian") || prompt.includes("vegan")) {
    return {
      meals: [
        {
          description:
            "200g tofu, 150g quinoa, 100g roasted chickpeas, 100g mixed vegetables, 10ml tahini",
        },
      ],
    };
  }

  if (prompt.includes("low carb") || prompt.includes("keto")) {
    return {
      meals: [
        {
          description:
            "200g ribeye steak, 150g cauliflower rice, 100g avocado, 50g butter, 100g asparagus",
        },
      ],
    };
  }

  // Default balanced meal suggestion
  return {
    meals: [
      {
        description:
          "150g grilled chicken breast, 200g cooked brown rice, 100g steamed broccoli, 10ml olive oil",
      },
    ],
  };
}
