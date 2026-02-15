import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import {
  FITNESS_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  WEIGHT_LOSS_GOAL_OPTIONS,
} from "~/constants";
import { calculateCalorieGoal } from "~/lib/calculateCalorieGoal";
import type { UserWithoutPassword } from "~/server/data/users.server";
import { extractTrpcFormErrors } from "~/server/trpc/errors";
import { trpc } from "~/utils/trpc";

interface SettingsHealthTabProps {
  user: UserWithoutPassword;
}

export function SettingsHealthTab({ user }: SettingsHealthTabProps) {
  const utils = trpc.useUtils();

  const updateHealth = trpc.user.updateHealth.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Health settings updated!");
    },
    onError: () => {
      toast.error("Failed to update health settings!");
    },
  });
  console.log(user.targetCalories);
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData = {
      age: data.age ? Number(data.age) : undefined,
      height: data.height ? Number(data.height) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      gender: data.gender as string,
      fitnessLevel: data.fitnessLevel as string,
      weightLossGoal: data.weightLossGoal as string,
      targetCalories: data.targetCalories ? Number(data.targetCalories) : null,
      targetProtein: data.targetProtein
        ? Number(data.targetProtein)
        : undefined,
      targetCarbs: data.targetCarbs ? Number(data.targetCarbs) : undefined,
      targetFat: data.targetFat ? Number(data.targetFat) : undefined,
      targetFiber: data.targetFiber ? Number(data.targetFiber) : undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateHealth.mutate(processedData as any);
  };

  const errors = extractTrpcFormErrors(updateHealth.error);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      key={JSON.stringify(user)}
    >
      <div className="space-y-4">
        <h3 className="font-semibold">Personal Information</h3>

        <SelectField
          label="Gender"
          name="gender"
          placeholder="Your gender"
          required
          options={GENDER_OPTIONS}
          errors={errors}
          defaultValue={user?.gender}
        />

        <InputField
          label="Age"
          name="age"
          type="number"
          required
          placeholder="Your age"
          errors={errors}
          defaultValue={user?.age}
        />

        <InputField
          label="Height (cm)"
          name="height"
          type="number"
          required
          placeholder="Your height in cm"
          errors={errors}
          defaultValue={user?.height}
        />

        <InputField
          label="Weight (kg)"
          name="weight"
          type="number"
          required
          placeholder="Your weight in kg"
          errors={errors}
          defaultValue={user?.weight}
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Activity & Goals</h3>

        <SelectField
          label="Fitness level"
          name="fitnessLevel"
          placeholder="Your fitness level"
          required
          errors={errors}
          options={FITNESS_LEVEL_OPTIONS}
          defaultValue={user?.fitnessLevel}
        />

        <SelectField
          label="Weight loss goal"
          name="weightLossGoal"
          placeholder="Your weight loss goal"
          required
          options={WEIGHT_LOSS_GOAL_OPTIONS}
          errors={errors}
          defaultValue={user?.weightLossGoal}
        />

        <p className="text-xs text-muted-foreground">
          Auto-calculated daily calorie goal: {calculateCalorieGoal(user)}kcal
        </p>

        <InputField
          label="Daily calorie goal (optional)"
          name="targetCalories"
          placeholder="Leave blank to auto-calculate"
          errors={errors}
          defaultValue={user?.targetCalories ?? undefined}
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Macro Goals (Optional)</h3>
        <p className="text-sm text-muted-foreground">
          Set individual goals for each macro. Leave blank to not track.
        </p>

        <InputField
          label="Protein goal (g)"
          name="targetProtein"
          type="number"
          placeholder="e.g., 150"
          errors={errors}
          defaultValue={user?.targetProtein ?? undefined}
        />

        <InputField
          label="Carbs goal (g)"
          name="targetCarbs"
          type="number"
          placeholder="e.g., 200"
          errors={errors}
          defaultValue={user?.targetCarbs ?? undefined}
        />

        <InputField
          label="Fat goal (g)"
          name="targetFat"
          type="number"
          placeholder="e.g., 60"
          errors={errors}
          defaultValue={user?.targetFat ?? undefined}
        />

        <InputField
          label="Fiber goal (g)"
          name="targetFiber"
          type="number"
          placeholder="e.g., 30"
          errors={errors}
          defaultValue={user?.targetFiber ?? undefined}
        />
      </div>

      <Button type="submit" className="mt-4" isLoading={updateHealth.isPending}>
        Save changes
      </Button>
    </form>
  );
}
