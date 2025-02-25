import { Form, Link, useActionData, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { CheckboxField } from "~/components/ui/checkbox-field";
import { InputField } from "~/components/ui/input-field";
import useIsLoading from "~/hooks/useIsLoading";
import { type LoginActionType } from "~/routes/__unauthed.login";

export default function Login() {
  const actionData = useActionData<LoginActionType>();
  const isLoading = useIsLoading();
  const location = useLocation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Please login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form
          method="post"
          action="/login"
          className="w-full flex flex-col space-y-4"
        >
          <InputField
            label="Email"
            name="email"
            type="text"
            required
            placeholder="hello@email.com"
            errors={actionData?.errors}
            defaultValue={actionData?.original?.email}
          />

          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="**************"
            required
            errors={actionData?.errors}
            defaultValue={actionData?.original?.password}
          />

          <CheckboxField
            name="rememberMe"
            label="Remember me"
            className="pb-4"
          />

          <input
            name="redirectUrl"
            type="hidden"
            defaultValue={location.pathname + location.search}
          />

          <Button type="submit" isLoading={isLoading}>
            Login
          </Button>

          <Link to="/signup" className="link text-center">
            Or sign up instead
          </Link>
        </Form>
      </CardContent>
    </Card>
  );
}
