import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { FITNESS_LEVEL_OPTIONS, WEIGHT_LOSS_GOAL_OPTIONS } from "~/constants";
import type { Step3Data } from "../Onboarding";
import { calculateCalorieGoal } from "~/lib/calculateCalorieGoal";
import useUser from "~/hooks/useUser";

type Step3Props = {
  onNext: (data: Step3Data) => void;
  defaultValues?: Partial<Step3Data>;
  errors?: Record<string, string> | null;
};

export function Step3Goals({ onNext, defaultValues, errors }: Step3Props) {
  const user = useUser();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const targetCaloriesValue = formData.get("targetCalories") as string;

    onNext({
      fitnessLevel: formData.get("fitnessLevel") as string,
      weightLossGoal: formData.get("weightLossGoal") as string,
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
        defaultValue={defaultValues?.fitnessLevel}
      />

      <SelectField
        label="Weight loss goal"
        name="weightLossGoal"
        placeholder="Select your goal"
        required
        options={WEIGHT_LOSS_GOAL_OPTIONS}
        errors={errors}
        defaultValue={defaultValues?.weightLossGoal}
      />

      <p className="text-xs text-muted-foreground">
        Auto-calculated daily calorie goal: {calculateCalorieGoal(user)}kcal
      </p>

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
