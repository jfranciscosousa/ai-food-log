import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import ErrorPage from "~/components/Error500Page";
import LoggedOutLayout from "~/components/layouts/LoggedOutLayout";
import { useOptionalUser } from "~/hooks/useUser";

export function ErrorBoundary() {
  return <ErrorPage />;
}

export default function UnauthedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useOptionalUser();
  const redirectUrl = location.state?.from || "/diary";

  useEffect(() => {
    if (user) navigate(redirectUrl);
  }, [user, navigate, redirectUrl]);

  if (user) return null;

  return (
    <LoggedOutLayout>
      <Outlet />
    </LoggedOutLayout>
  );
}
