import type { ReactNode } from "react";
import { Form, NavLink } from "react-router";
import useIsLoading from "~/hooks/useIsLoading";
import { UserProvider } from "~/hooks/useUser";
import type { AuthedRouteData } from "~/routes/__authed";
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
    <div className="flex flex-col h-screen w-full px-4 sm:px-12">
      <nav className="max-w-6xl mx-auto flex items-center w-full justify-between shrink-0 py-8">
        <p className="hidden sm:block">Welcome, {user.name}!</p>

        <ul className="flex flex-row space-x-4 items-center ml-0 xs:ml-auto">
          <li>
            <NavLink
              to="/diary"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              Diary
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/preview"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              Preview
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
