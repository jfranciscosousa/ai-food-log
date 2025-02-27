import type { LoaderFunctionArgs } from "react-router";
import { Outlet, useLoaderData } from "react-router";
import ErrorPage from "~/components/Error500Page";
import LoggedInLayout from "~/components/layouts/LoggedInLayout";
import LoggedOutLayout from "~/components/layouts/LoggedOutLayout";
import Login from "~/modules/Login";
import { userFromRequest } from "~/server/auth.server";
import type { Info } from "./+types/__authed";

export type AuthedRouteData = Info["loaderData"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await userFromRequest(request);

  return { user };
};

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function AppPage() {
  const { user } = useLoaderData<AuthedRouteData>();

  if (!user) {
    return (
      <LoggedOutLayout>
        <Login />
      </LoggedOutLayout>
    );
  }

  return (
    <LoggedInLayout>
      <Outlet />
    </LoggedInLayout>
  );
}
