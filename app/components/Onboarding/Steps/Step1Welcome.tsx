import { InputField } from "~/components/ui/input-field";
import type { Step1Data } from "../Onboarding";

type Step1Props = {
  onNext: (data: Step1Data) => void;
  defaultValues?: Partial<Step1Data>;
  errors?: Record<string, string> | null;
};

export function Step1Welcome({ onNext, defaultValues, errors }: Step1Props) {
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onNext({
      email: formData.get("email") as string,
      name: formData.get("name") as string,
      password: formData.get("password") as string,
      passwordConfirmation: formData.get("passwordConfirmation") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Email"
        name="email"
        type="email"
        required
        placeholder="hello@email.com"
        defaultValue={defaultValues?.email}
        errors={errors}
      />

      <InputField
        label="Name"
        name="name"
        type="text"
        required
        placeholder="How you would like to be called"
        defaultValue={defaultValues?.name}
        errors={errors}
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        placeholder="**************"
        required
        defaultValue={defaultValues?.password}
        errors={errors}
      />

      <InputField
        label="Confirm password"
        name="passwordConfirmation"
        type="password"
        placeholder="**************"
        required
        defaultValue={defaultValues?.passwordConfirmation}
        errors={errors}
      />

      <button type="submit" hidden />
    </form>
  );
}
