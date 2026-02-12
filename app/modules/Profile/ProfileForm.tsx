import { Link, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckboxField } from "~/components/ui/checkbox-field";
import { InputField } from "~/components/ui/input-field";
import { SelectField } from "~/components/ui/select-field";
import { FitnessLevel, Gender, WeightLossGoal } from "~/constants";
import { useToast } from "~/hooks/use-toast";
import type { UserWithoutPassword } from "~/server/data/users.server";
import { extractTrpcFormErrors } from "~/server/trpc/errors";
import { trpc } from "~/utils/trpc";

type Props =
  | {
      mode: "create";
      user?: undefined;
    }
  | {
      mode: "update";
      user: UserWithoutPassword;
    };

export default function ProfileForm({ mode, user }: Props) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const signup = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/diary");
    },
  });

  const updateProfile = trpc.user.update.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast({ title: "Updated profile!" });
    },
    onError: () => {
      toast({
        title: "Failed to update profile!",
        variant: "destructive",
      });
    },
  });

  const mutation = mode === "create" ? signup : updateProfile;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const processedData = {
      ...data,
      age: data.age ? Number(data.age) : undefined,
      height: data.height ? Number(data.height) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      rememberMe: formData.get("rememberMe") === "on",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutation.mutate(processedData as any);
  };

  const errors = extractTrpcFormErrors(signup.error || updateProfile.error);

  return (
    <>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Please sign up" : "Profile"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

              <Button
                type="submit"
                className="mt-8"
                isLoading={mutation.isPending}
              >
                Sign up
              </Button>

              <Link to="/login" className="link text-center">
                Or login instead
              </Link>
            </>
          )}

          {mode === "update" && (
            <>
              <Button
                type="submit"
                className="mt-8"
                isLoading={mutation.isPending}
              >
                Update profile
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </>
  );
}
