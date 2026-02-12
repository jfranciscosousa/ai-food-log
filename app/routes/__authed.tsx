import { Navigate, Outlet } from "react-router";
import ErrorPage from "~/components/Error500Page";
import LoggedInLayout from "~/components/layouts/LoggedInLayout";
import { trpc } from "~/utils/trpc";

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function AppPage() {
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <LoggedInLayout>
      <Outlet />
    </LoggedInLayout>
  );
}
