import { Navigate, Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import LoggedOutLayout from "~/components/layouts/LoggedOutLayout";
import ErrorPage from "~/components/Error500Page";
import { trpc } from "~/utils/trpc";

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function UnauthedLayout() {
  const navigate = useNavigate();
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/diary");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return null; // or a loading spinner
  }

  return (
    <LoggedOutLayout>
      {user && <Navigate to="/diary" />}

      <Outlet />
    </LoggedOutLayout>
  );
}
