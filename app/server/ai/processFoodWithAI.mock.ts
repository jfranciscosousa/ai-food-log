import type { Prompt } from "./aiutils";

/**
 * Mock AI processor for testing
 * Returns deterministic results based on input patterns
 */
export async function processFoodWithAIMock(prompt: Prompt) {
  const content =
    prompt.type === "string" ? prompt.content.toLowerCase() : "image";

  // Pattern matching for common test inputs
  if (content.includes("rice") && content.includes("chicken")) {
    return {
      name: "Rice and Chicken",
      icon: "Drumstick",
      invalid: false,
      items: [
        {
          name: "Cooked White Rice",
          servingSize: 100,
          calories: 130,
          protein: 2.7,
          carbs: 28.2,
          fat: 0.3,
          fiber: 0.4,
        },
        {
          name: "Chicken Breast",
          servingSize: 250,
          calories: 412,
          protein: 77.5,
          carbs: 0,
          fat: 10.9,
          fiber: 0,
        },
      ],
    };
  }

  if (content.includes("oatmeal") || content.includes("oats")) {
    return {
      name: "Oatmeal Breakfast",
      icon: "Sun",
      invalid: false,
      items: [
        {
          name: "Rolled Oats",
          servingSize: 80,
          calories: 304,
          protein: 10.7,
          carbs: 54.8,
          fat: 5.4,
          fiber: 8.2,
        },
        {
          name: "Whole Milk",
          servingSize: 200,
          calories: 122,
          protein: 6.6,
          carbs: 9.4,
          fat: 6.4,
          fiber: 0,
        },
        {
          name: "Banana",
          servingSize: 100,
          calories: 89,
          protein: 1.1,
          carbs: 22.8,
          fat: 0.3,
          fiber: 2.6,
        },
      ],
    };
  }

  if (content.includes("salad")) {
    return {
      name: "Mixed Salad",
      icon: "Salad",
      invalid: false,
      items: [
        {
          name: "Mixed Greens",
          servingSize: 100,
          calories: 25,
          protein: 2.5,
          carbs: 4.3,
          fat: 0.4,
          fiber: 2.1,
        },
        {
          name: "Grilled Chicken",
          servingSize: 150,
          calories: 247,
          protein: 46.5,
          carbs: 0,
          fat: 6.5,
          fiber: 0,
        },
        {
          name: "Olive Oil Dressing",
          servingSize: 15,
          calories: 120,
          protein: 0,
          carbs: 0,
          fat: 14,
          fiber: 0,
        },
      ],
    };
  }

  if (content.includes("protein shake") || content.includes("whey")) {
    return {
      name: "Protein Shake",
      icon: "Milk",
      invalid: false,
      items: [
        {
          name: "Whey Protein Powder",
          servingSize: 30,
          calories: 110,
          protein: 24,
          carbs: 2,
          fat: 1,
          fiber: 0,
        },
        {
          name: "Water",
          servingSize: 300,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
        },
      ],
    };
  }

  if (content.includes("pizza")) {
    return {
      name: "Pizza",
      icon: "Pizza",
      invalid: false,
      items: [
        {
          name: "Cheese Pizza",
          servingSize: 300,
          calories: 750,
          protein: 30,
          carbs: 90,
          fat: 28,
          fiber: 4,
        },
      ],
    };
  }

  if (content.includes("egg") || content.includes("eggs")) {
    return {
      name: "Scrambled Eggs",
      icon: "Egg",
      invalid: false,
      items: [
        {
          name: "Whole Eggs",
          servingSize: 150,
          calories: 215,
          protein: 18.8,
          carbs: 1.1,
          fat: 14.3,
          fiber: 0,
        },
        {
          name: "Butter",
          servingSize: 10,
          calories: 72,
          protein: 0.1,
          carbs: 0,
          fat: 8.1,
          fiber: 0,
        },
      ],
    };
  }

  if (
    content.includes("invalid") ||
    content.includes("test invalid") ||
    content.includes("xyz123")
  ) {
    return {
      name: "",
      icon: "AlertCircle",
      invalid: true,
      items: [],
    };
  }

  // Default mock response for any other input
  return {
    name: "Test Meal",
    icon: "Apple",
    invalid: false,
    items: [
      {
        name: "Generic Food Item",
        servingSize: 100,
        calories: 200,
        protein: 10,
        carbs: 20,
        fat: 8,
        fiber: 2,
      },
    ],
  };
}
