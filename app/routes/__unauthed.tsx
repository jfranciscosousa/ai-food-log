import { Navigate, Outlet } from "react-router";
import ErrorPage from "~/components/Error500Page";
import LoggedOutLayout from "~/components/layouts/LoggedOutLayout";
import { useOptionalUser } from "~/hooks/useUser";

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function UnauthedLayout() {
  const user = useOptionalUser();

  if (user) return <Navigate to="/diary" />;

  return (
    <LoggedOutLayout>
      <Outlet />
    </LoggedOutLayout>
  );
}
