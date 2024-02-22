import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { CheckboxField } from "~/components/ui/checkbox-field";
import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { FitnessLevel, Gender, WeightLossGoal } from "~/constants";
import { createUser } from "~/server/data/users/index.server";
import { GenericDataError } from "~/server/data/utils/types";
import useIsLoading from "~/hooks/useIsLoading";
import { authenticate, userFromRequest } from "~/server/auth.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await userFromRequest(request);

  if (user) return redirect("/diary");

  return null;
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const form = await request.formData();
  const result = await createUser(form);

  if (result.errors) return result.errors;

  return authenticate(result.data, { rememberMe: result.data.rememberMe });
};

export const meta: MetaFunction = () => [
  {
    title: "Sign up",
  },
];

export default function SignUp() {
  const errors = useActionData<GenericDataError>();
  const isLoading = useIsLoading();

  return (
    <Card className="max-w-lg w-full mx-auto flex items-center justify-center">
      <Form
        method="post"
        action="/signup"
        className="p-10 w-full flex flex-col space-y-4"
      >
        <CardTitle className="mb-8">Please sign up</CardTitle>

        <InputField
          label="Email"
          name="email"
          type="text"
          required
          placeholder="hello@email.com"
          errors={errors}
        />

        <InputField
          label="Name"
          name="name"
          type="text"
          required
          placeholder="How you would like to be called"
          errors={errors}
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
        />

        <InputField
          label="Age"
          name="age"
          type="number"
          required
          placeholder="Your age"
          errors={errors}
        />

        <InputField
          label="Height (cm)"
          name="height"
          type="number"
          required
          placeholder="Your height in cm"
          errors={errors}
        />

        <InputField
          label="Weight (kg)"
          name="weight"
          type="number"
          required
          placeholder="Your weight in kg"
          errors={errors}
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
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="**************"
          required
          errors={errors}
        />

        <InputField
          label="Confirm password"
          name="passwordConfirmation"
          type="password"
          placeholder="**************"
          required
          errors={errors}
        />

        <InputField
          label="Invite token"
          name="inviteToken"
          type="text"
          required
          placeholder=""
          errors={errors}
        />

        <CheckboxField name="rememberMe" label="Remember me" className="pb-4" />

        <Button type="submit" className="mt-8" isLoading={isLoading}>
          Sign up
        </Button>

        <Link to="/login" className="link text-center">
          Or login instead
        </Link>
      </Form>
    </Card>
  );
}
