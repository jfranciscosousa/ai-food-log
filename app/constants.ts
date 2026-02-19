// Fitness Level Constants
export const FITNESS_LEVEL = {
  SEDENTARY: "SEDENTARY",
  LIGHTLY_ACTIVE: "LIGHTLY_ACTIVE",
  MODERATELY_ACTIVE: "MODERATELY_ACTIVE",
  VERY_ACTIVE: "VERY_ACTIVE",
  EXTRA_ACTIVE: "EXTRA_ACTIVE",
} as const;

export const FITNESS_LEVEL_LABELS = {
  [FITNESS_LEVEL.SEDENTARY]: "Sedentary",
  [FITNESS_LEVEL.LIGHTLY_ACTIVE]: "Lightly Active",
  [FITNESS_LEVEL.MODERATELY_ACTIVE]: "Moderately Active",
  [FITNESS_LEVEL.VERY_ACTIVE]: "Very Active",
  [FITNESS_LEVEL.EXTRA_ACTIVE]: "Extra Active",
} as const;

export const FITNESS_LEVEL_DESCRIPTIONS = {
  [FITNESS_LEVEL.SEDENTARY]:
    "Little to no exercise, desk job (1.2x multiplier)",
  [FITNESS_LEVEL.LIGHTLY_ACTIVE]:
    "Light exercise 1-3 days/week (1.375x multiplier)",
  [FITNESS_LEVEL.MODERATELY_ACTIVE]:
    "Moderate exercise 3-5 days/week (1.55x multiplier)",
  [FITNESS_LEVEL.VERY_ACTIVE]:
    "Hard exercise 6-7 days/week (1.725x multiplier)",
  [FITNESS_LEVEL.EXTRA_ACTIVE]:
    "Very hard exercise, physical job, or training twice daily (1.9x multiplier)",
} as const;

export const FITNESS_LEVEL_OPTIONS: Array<{
  value: string;
  label: string;
}> = Object.values(FITNESS_LEVEL).map((value) => ({
  value,
  label: FITNESS_LEVEL_LABELS[value],
  description: FITNESS_LEVEL_DESCRIPTIONS[value],
}));

// Weight Loss Goal Constants
export const WEIGHT_LOSS_GOAL = {
  MAINTAIN: "MAINTAIN",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

export const WEIGHT_LOSS_GOAL_LABELS = {
  [WEIGHT_LOSS_GOAL.MAINTAIN]: "Maintain Weight",
  [WEIGHT_LOSS_GOAL.LOW]: "Slow Loss",
  [WEIGHT_LOSS_GOAL.MEDIUM]: "Moderate Loss",
  [WEIGHT_LOSS_GOAL.HIGH]: "Fast Loss",
} as const;

export const WEIGHT_LOSS_GOAL_DESCRIPTIONS = {
  [WEIGHT_LOSS_GOAL.MAINTAIN]: "Maintain current weight (0 cal deficit)",
  [WEIGHT_LOSS_GOAL.LOW]: "~0.25 kg/week loss (250 cal deficit)",
  [WEIGHT_LOSS_GOAL.MEDIUM]: "~0.5 kg/week loss (500 cal deficit)",
  [WEIGHT_LOSS_GOAL.HIGH]: "~1 kg/week loss (1000 cal deficit)",
} as const;

export const WEIGHT_LOSS_GOAL_OPTIONS: Array<{
  value: string;
  label: string;
}> = Object.values(WEIGHT_LOSS_GOAL).map((value) => ({
  value,
  label: WEIGHT_LOSS_GOAL_LABELS[value],
  description: WEIGHT_LOSS_GOAL_DESCRIPTIONS[value],
}));

// Gender Constants
export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;

export const GENDER_LABELS = {
  [GENDER.MALE]: "Male",
  [GENDER.FEMALE]: "Female",
} as const;

export const GENDER_OPTIONS: Array<{
  value: string;
  label: string;
}> = Object.values(GENDER).map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));
