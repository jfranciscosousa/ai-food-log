// It's ok for this specific component to ignore set states in effects
/* eslint-disable react-hooks/set-state-in-effect */

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { AppSidebar } from "../AppSidebar";
import { NavigationProgress } from "../NavigationProgress";
import { Button } from "../ui/button";

export default function LoggedInLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <NavigationProgress />

      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile header */}
          <header className="flex items-center gap-3 px-4 h-14 border-b md:hidden shrink-0">
            <Button
              variant="ghost"
              size="icon"
              aria-expanded={sidebarOpen}
              aria-controls="app-sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
              <span className="sr-only">
                {sidebarOpen ? "Close menu" : "Open menu"}
              </span>
            </Button>

            <h1 className="text-lg font-bold">Vigor</h1>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-2xl mx-auto p-4 space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
