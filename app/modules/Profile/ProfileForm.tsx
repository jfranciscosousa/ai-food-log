import { Form, Link } from "react-router";
import { Button } from "~/components/ui/button";
import { CardTitle } from "~/components/ui/card";
import { CheckboxField } from "~/components/ui/checkbox-field";
import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { FitnessLevel, Gender, WeightLossGoal } from "~/constants";
import useIsLoading from "~/hooks/useIsLoading";
import useUser from "~/hooks/useUser";
import { type GenericDataError } from "~/server/data/utils/types";

type Props =
  | {
      errors?: GenericDataError | null;
      mode: "create";
      user?: undefined;
    }
  | {
      errors?: GenericDataError | null;
      mode: "update";
      user: ReturnType<typeof useUser>;
    };

export default function ProfileForm({ errors, mode, user }: Props) {
  const isLoading = useIsLoading();

  return (
    <Form method="post" className="p-10 w-full flex flex-col space-y-4">
      <CardTitle className="mb-8">Please sign up</CardTitle>

      <InputField
        label="Email"
        name="email"
        type="text"
        required
        placeholder="hello@email.com"
        errors={errors}
        defaultValue={user?.email}
      />

      <InputField
        label="Name"
        name="name"
        type="text"
        required
        placeholder="How you would like to be called"
        errors={errors}
        defaultValue={user?.name}
      />

      <SelectField
        label="Gender"
        name="gender"
        placeholder="Your gender"
        required
        options={Object.entries(Gender).map(([key, value]) => ({
          value: key,
          label: value,
        }))}
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

      <SelectField
        label="Fitness level"
        name="fitnessLevel"
        placeholder="Your fitness level"
        required
        errors={errors}
        options={Object.values(FitnessLevel).map((value) => ({
          value,
          label: value,
        }))}
        defaultValue={user?.fitnessLevel}
      />

      <SelectField
        label="Weight loss goal"
        name="weightLossGoal"
        placeholder="Your weight loss goal"
        required
        options={Object.values(WeightLossGoal).map((value) => ({
          value,
          label: value,
        }))}
        errors={errors}
        defaultValue={user?.weightLossGoal}
      />

      {mode === "update" && (
        <InputField
          label="Current password"
          name="currentPassword"
          type="password"
          placeholder="**************"
          required
          errors={errors}
        />
      )}

      {mode === "update" && (
        <InputField
          label="New password"
          name="newPassword"
          type="password"
          placeholder="**************"
          errors={errors}
        />
      )}

      {mode === "create" && (
        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="**************"
          required
          errors={errors}
        />
      )}

      <InputField
        label="Confirm password"
        name="passwordConfirmation"
        type="password"
        placeholder="**************"
        required={mode === "create"}
        errors={errors}
      />

      {mode === "create" && (
        <InputField
          label="Invite token"
          name="inviteToken"
          type="text"
          required
          placeholder=""
          errors={errors}
        />
      )}

      {mode === "create" && (
        <>
          <CheckboxField
            name="rememberMe"
            label="Remember me"
            className="pb-4"
          />

          <Button type="submit" className="mt-8" isLoading={isLoading}>
            Sign up
          </Button>

          <Link to="/login" className="link text-center">
            Or login instead
          </Link>
        </>
      )}

      {mode === "update" && (
        <>
          <Button type="submit" className="mt-8" isLoading={isLoading}>
            Update profile
          </Button>
        </>
      )}
    </Form>
  );
}
