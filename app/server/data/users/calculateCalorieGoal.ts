import { FitnessLevel, Gender, WeightLossGoal } from "@prisma/client";

export function calculateCalorieGoal(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  fitnessLevel: FitnessLevel,
  weightLossGoal: WeightLossGoal,
): number {
  // Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation
  const bmr =
    gender === "MALE"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  // Adjust BMR based on activity level
  const activityFactors = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9,
  };
  const activeMultiplier = activityFactors[fitnessLevel];
  let maintenanceCalories = bmr * activeMultiplier;

  // Adjust based on weight loss target
  const weightLossCalories = {
    MAINTAIN: 0,
    LOW: 250, // ~0.25kg loss per week
    MEDIUM: 500, // ~0.5kg loss per week
    HIGH: 1000, // ~1kg loss per week
  };
  maintenanceCalories -= weightLossCalories[weightLossGoal];

  return maintenanceCalories;
}
