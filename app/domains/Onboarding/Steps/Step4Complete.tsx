import { InputField } from "~/components/ui/input-field";
import type { Step1Data, Step2Data, Step4Data } from "../Onboarding";

type Step4Props = {
  onNext: (data: Step4Data) => void;
  defaultValues?: Partial<Step4Data>;
  errors?: Record<string, string> | null;
  summary?: Pick<
    Step1Data & Step2Data,
    "name" | "email" | "age" | "height" | "weight"
  >;
};

export function Step4Complete({
  onNext,
  defaultValues,
  errors,
  summary,
}: Step4Props) {
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    onNext({
      inviteToken: formData.get("inviteToken") as string,
      rememberMe: formData.get("rememberMe") === "on",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Invite token"
        name="inviteToken"
        type="text"
        required
        placeholder="Enter your invite token"
        defaultValue={defaultValues?.inviteToken}
        errors={errors}
      />

      <div className="items-top flex space-x-2 pb-4">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          defaultChecked={defaultValues?.rememberMe}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none"
        >
          Remember me on this device
        </label>
      </div>

      <div className="rounded-lg border border-muted bg-muted/50 p-4">
        <h4 className="mb-2 font-semibold">Summary</h4>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Name:</dt>
            <dd className="font-medium">{summary?.name || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Email:</dt>
            <dd className="font-medium">{summary?.email || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Age:</dt>
            <dd className="font-medium">
              {summary?.age ? `${summary.age} years` : "-"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Height:</dt>
            <dd className="font-medium">
              {summary?.height ? `${summary.height} cm` : "-"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Weight:</dt>
            <dd className="font-medium">
              {summary?.weight ? `${summary.weight} kg` : "-"}
            </dd>
          </div>
        </dl>
      </div>

      <button type="submit" hidden />
    </form>
  );
}
