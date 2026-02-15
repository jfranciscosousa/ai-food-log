import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigation } from "react-router";
import { UserNav } from "../UserNav";
import { BaseLayout } from "./BaseLayout";

export default function LoggedInLayout({ children }: { children: ReactNode }) {
  const { state } = useNavigation();

  return (
    <BaseLayout>
      <div className="flex items-center justify-between">
        <span className="flex gap-2 items-center">
          <h1 className="text-2xl font-bold tracking-tight">AI Food Log</h1>

          {(state === "loading" || state === "submitting") && (
            <Loader2 className="animate-spin fade-in" />
          )}
        </span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 ml-2 pl-2">
            <UserNav />
          </div>
        </div>
      </div>

      {children}
    </BaseLayout>
  );
}
