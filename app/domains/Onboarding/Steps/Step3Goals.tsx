import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { FITNESS_LEVEL_OPTIONS, WEIGHT_LOSS_GOAL_OPTIONS } from "~/constants";
import { calculateCalorieGoal } from "~/lib/calculateCalorieGoal";
import type { Step2Data, Step3Data } from "../Onboarding";
import { useState } from "react";
import type {
  FitnessLevel,
  Gender,
  WeightLossGoal,
} from "~/generated/prisma/enums";

type Step3Props = {
  onNext: (data: Step3Data) => void;
  defaultValues?: Partial<Step3Data>;
  errors?: Record<string, string> | null;
  step2Data: Step2Data;
};

export function Step3Goals({
  onNext,
  defaultValues,
  errors,
  step2Data,
}: Step3Props) {
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(
    defaultValues?.fitnessLevel as FitnessLevel,
  );
  const [weightLossGoal, setWeightLossGoal] = useState<WeightLossGoal>(
    defaultValues?.weightLossGoal as WeightLossGoal,
  );

  const { height, weight, age, gender } = step2Data;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const targetCaloriesValue = formData.get("targetCalories") as string;

    onNext({
      fitnessLevel,
      weightLossGoal,
      targetCalories: targetCaloriesValue
        ? Number(targetCaloriesValue)
        : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        label="Fitness level"
        name="fitnessLevel"
        placeholder="Select your fitness level"
        required
        errors={errors}
        options={FITNESS_LEVEL_OPTIONS}
        value={fitnessLevel ?? ""}
        onValueChange={(value) => setFitnessLevel(value as FitnessLevel)}
      />

      <SelectField
        label="Weight loss goal"
        name="weightLossGoal"
        placeholder="Select your goal"
        required
        options={WEIGHT_LOSS_GOAL_OPTIONS}
        errors={errors}
        value={weightLossGoal ?? ""}
        onValueChange={(value) => setWeightLossGoal(value as WeightLossGoal)}
      />

      {fitnessLevel && weightLossGoal && weight && age && height ? (
        <p className="text-xs text-muted-foreground">
          Auto-calculated daily calorie goal:{" "}
          {calculateCalorieGoal({
            weight,
            age,
            height,
            fitnessLevel,
            weightLossGoal,
            gender: gender as Gender,
          })}
          kcal
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Auto-calculated daily calorie goal: N/A
        </p>
      )}

      <InputField
        label="Daily calorie goal (optional)"
        name="targetCalories"
        type="number"
        placeholder="Leave blank to auto-calculate"
        errors={errors}
        defaultValue={defaultValues?.targetCalories?.toString()}
      />

      <button type="submit" hidden />
    </form>
  );
}
