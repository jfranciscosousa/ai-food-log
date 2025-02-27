import type { ReactNode } from "react";
import ThemeChanger from "../ThemeChanger";
import { UserNav } from "../UserNav";
import { BaseLayout } from "./BaseLayout";

export default function LoggedInLayout({ children }: { children: ReactNode }) {
  return (
    <BaseLayout>
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
    </BaseLayout>
  );
}
