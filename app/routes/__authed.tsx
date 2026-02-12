import { Navigate, Outlet } from "react-router";
import ErrorPage from "~/components/Error500Page";
import LoggedInLayout from "~/components/layouts/LoggedInLayout";
import { useOptionalUser } from "~/hooks/useUser";

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function AppPage() {
  const user = useOptionalUser();

  if (!user) return <Navigate to="/login" />;

  return (
    <LoggedInLayout>
      <Outlet />
    </LoggedInLayout>
  );
}
