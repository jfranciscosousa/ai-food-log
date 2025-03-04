import type {
  ActionFunctionArgs,
  LoaderFunction,
  MetaFunction,
} from "react-router";
import { redirect } from "react-router";
import Login from "~/modules/Login";
import { authenticate, userFromRequest } from "~/server/auth.server";
import type { Info } from "./+types/__unauthed.login";
import Users from "~/server/data/users.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await userFromRequest(request);

  if (user) return redirect("/diary");

  return null;
};

export type LoginActionType = Info["actionData"];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const original = Object.fromEntries(formData) as Record<string, string>;
  const result = await Users.login(formData);

  if (result.errors) return { errors: result.errors, original };

  return authenticate(result.data, {
    redirectUrl: original.redirectUrl as string,
    rememberMe: result.data.rememberMe,
  }) as never;
};

export const meta: MetaFunction = () => [
  {
    title: "Login",
  },
];

export default function LoginPage() {
  return <Login />;
}
