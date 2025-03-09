import type { ActionFunctionArgs, LoaderFunction } from "react-router";
import { redirect } from "react-router";
import Login from "~/modules/Login";
import { authenticate, userFromRequest } from "~/server/auth.server";
import { UsersService } from "~/server/data/users.server";
import type { Info } from "./+types/__unauthed.login";

export const meta = () => [
  {
    title: "Login | AI Food Log",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  const user = await userFromRequest(request);

  if (user) return redirect("/diary");

  return null;
};

export type LoginActionType = Info["actionData"];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const original = Object.fromEntries(formData) as Record<string, string>;
  const result = await UsersService.login(formData);

  if (result.errors) return { errors: result.errors, original };

  return authenticate(result.data, {
    redirectUrl: original.redirectUrl as string,
    rememberMe: result.data.rememberMe,
  }) as never;
};

export default function LoginPage() {
  return <Login />;
}
