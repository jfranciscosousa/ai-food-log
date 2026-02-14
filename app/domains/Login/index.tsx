import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckboxField } from "~/components/ui/checkbox-field";
import { InputField } from "~/components/ui/input-field";
import { trpc } from "~/utils/trpc";

export default function Login() {
  const utils = trpc.useUtils();

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    login.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      rememberMe: formData.get("rememberMe") === "on",
    });
  };

  const errors =
    login.error?.data && "cause" in login.error.data
      ? (login.error.data.cause as Record<string, string>)
      : undefined;

  return (
    <Card className="md:w-xl w-full">
      <CardHeader>
        <CardTitle>Please login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-4"
        >
          <InputField
            label="Email"
            name="email"
            type="text"
            required
            placeholder="hello@email.com"
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

          <CheckboxField
            name="rememberMe"
            label="Remember me"
            className="pb-4"
          />

          <Button type="submit" isLoading={login.isPending}>
            Login
          </Button>

          <Link to="/signup" className="link text-center">
            Or sign up instead
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
