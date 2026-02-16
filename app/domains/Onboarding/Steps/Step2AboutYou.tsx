import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { GENDER_OPTIONS } from "~/constants";
import type { Gender } from "~/generated/prisma/enums";
import type { Step2Data } from "../Onboarding";

type Step2Props = {
  onNext: (data: Step2Data) => void;
  defaultValues?: Partial<Step2Data>;
  errors?: Record<string, string> | null;
};

export function Step2AboutYou({ onNext, defaultValues, errors }: Step2Props) {
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onNext({
      gender: formData.get("gender") as Gender,
      age: Number(formData.get("age") as string),
      height: Number(formData.get("height") as string),
      weight: Number(formData.get("weight") as string),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SelectField
        label="Gender"
        name="gender"
        placeholder="Select your gender"
        required
        errors={errors}
        options={GENDER_OPTIONS}
        defaultValue={defaultValues?.gender}
      />

      <InputField
        label="Age"
        name="age"
        type="number"
        required
        placeholder="Your age"
        defaultValue={defaultValues?.age}
        errors={errors}
      />

      <InputField
        label="Height (cm)"
        name="height"
        type="number"
        required
        placeholder="Your height in cm"
        defaultValue={defaultValues?.height}
        errors={errors}
      />

      <InputField
        label="Weight (kg)"
        name="weight"
        type="number"
        required
        placeholder="Your weight in kg"
        defaultValue={defaultValues?.weight}
        errors={errors}
      />

      <button type="submit" hidden />
    </form>
  );
}
