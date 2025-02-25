import type { ReactNode } from "react";

export function BaseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background">
      <main className="space-y-6 p-4 max-w-2xl mx-auto h-full flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
