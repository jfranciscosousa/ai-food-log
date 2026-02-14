import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { FitnessLevel, WeightLossGoal } from "~/constants";
import type { Step3Data } from "../Onboarding";

type Step3Props = {
  onNext: (data: Step3Data) => void;
  defaultValues?: Partial<Step3Data>;
  errors?: Record<string, string> | null;
};

export function Step3Goals({ onNext, defaultValues, errors }: Step3Props) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        options={Object.values(FitnessLevel).map((value) => ({
          value,
          label: value
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        }))}
        defaultValue={defaultValues?.fitnessLevel}
      />

      <SelectField
        label="Weight loss goal"
        name="weightLossGoal"
        placeholder="Select your goal"
        required
        options={Object.values(WeightLossGoal).map((value) => ({
          value,
          label: value.charAt(0) + value.slice(1).toLowerCase(),
        }))}
        errors={errors}
        defaultValue={defaultValues?.weightLossGoal}
      />

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
