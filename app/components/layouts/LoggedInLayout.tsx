import type { ReactNode } from "react";
import { UserProvider } from "~/hooks/useUser";
import type { AuthedRouteData } from "~/routes/__authed";
import ThemeChanger from "../ThemeChanger";
import { UserNav } from "../UserNav";

function InnerLoggedInLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">AI Food Log</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 ml-2 pl-2">
                <ThemeChanger />
                <UserNav />
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </main>
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
      <InnerLoggedInLayout>{children}</InnerLoggedInLayout>
    </UserProvider>
  );
}
