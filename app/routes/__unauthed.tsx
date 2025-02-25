import { Outlet } from "react-router";
import { type LoaderFunction, redirect } from "react-router";
import LoggedOutLayout from "~/components/layouts/LoggedOutLayout";
import { userFromRequest } from "~/server/auth.server";
import ErrorPage from "~/components/Error500Page";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await userFromRequest(request);

  if (user) return redirect("/diary");

  return null;
};

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function UnauthedLayout() {
  return (
    <LoggedOutLayout>
      <Outlet />
    </LoggedOutLayout>
  );
}
