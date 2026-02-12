import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import ErrorPage from "~/components/Error500Page";
import LoggedInLayout from "~/components/layouts/LoggedInLayout";
import { useOptionalUser } from "~/hooks/useUser";

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function AppPage() {
  const navigate = useNavigate();
  const user = useOptionalUser();

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        state: { from: window.location.pathname + window.location.search },
      });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <LoggedInLayout>
      <Outlet />
    </LoggedInLayout>
  );
}
