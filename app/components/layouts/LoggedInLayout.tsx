import { Form, NavLink } from "@remix-run/react";
import { ReactNode } from "react";
import useIsLoading from "~/hooks/useIsLoading";
import { UserProvider } from "~/hooks/useUser";
import { AuthedRouteData } from "~/routes/__authed";
import ThemeChanger from "../ThemeChanger";
import { Button } from "../ui/button";

function InnerLoggedInLayout({
  user,
  children,
}: {
  user: NonNullable<AuthedRouteData["user"]>;
  children: ReactNode;
}) {
  const isLoading = useIsLoading({ action: "/logout" });

  return (
    <div className="flex flex-col h-screen w-full px-12 sm:px-6">
      <nav className="max-w-6xl mx-auto flex items-center w-full justify-between shrink-0 py-8">
        <p className="sm:hidden">Welcome, {user.name}!</p>

        <ul className="flex flex-row space-x-4 items-center sm:ml-auto">
          <li>
            <NavLink
              to="/diary"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              Home
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/profile"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              Profile
            </NavLink>
          </li>

          <li>
            <Form method="post" action="/logout">
              <Button type="submit" variant="destructive" disabled={isLoading}>
                Logout
              </Button>
            </Form>
          </li>

          <li>
            <ThemeChanger />
          </li>
        </ul>
      </nav>

      <div className="contents">{children}</div>
    </div>
  );
}

export default function LoggedInLayout({
  user,
  children,
}: {
  user: NonNullable<AuthedRouteData["user"]>;
  children: ReactNode;
}) {
  return (
    <UserProvider user={user}>
      <InnerLoggedInLayout user={user}>{children}</InnerLoggedInLayout>
    </UserProvider>
  );
}
