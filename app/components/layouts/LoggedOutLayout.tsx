import type { ReactNode } from "react";

export default function LoggedOutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {children}
    </div>
  );
}
