import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  LogOut,
  Notebook,
  ScanEye,
  User,
  X,
} from "lucide-react";
import { NavLink } from "react-router";
import { useState } from "react";
import ThemeChanger from "./ThemeChanger";
import { Button } from "./ui/button";
import { cn } from "~/utils";
import useUser from "~/hooks/useUser";
import { trpc } from "~/utils/trpc";

const navLinks = [
  { to: "/diary", icon: Notebook, label: "Diary" },
  { to: "/workout", icon: Dumbbell, label: "Workout" },
  { to: "/preview", icon: ScanEye, label: "Preview" },
  { to: "/settings", icon: User, label: "Settings" },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const user = useUser();
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => utils.auth.me.invalidate(),
  });

  return (
    <>
      {/* Mobile backdrop — presentational, not interactive for AT */}
      {open && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        aria-label="Main navigation"
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r transition-all duration-300 flex flex-col",
          "md:relative md:z-auto md:translate-x-0 md:shrink-0",
          open ? "translate-x-0" : "-translate-x-full",
          "w-64",
          collapsed && "md:w-16",
        )}
      >
        {/* Sidebar header */}
        <div className="flex items-center h-14 px-3 border-b gap-2">
          {/* Not an h1 — the page already has one in the mobile header.
              The aside's aria-label identifies this landmark for AT. */}
          {!collapsed && (
            <p className="text-lg font-bold truncate flex-1">Vigor</p>
          )}

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden ml-auto shrink-0"
            onClick={onClose}
          >
            <X aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Close menu</span>
          </Button>

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex shrink-0 ml-auto"
            aria-expanded={!collapsed}
            aria-controls="app-sidebar"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            ) : (
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            )}
            <span className="sr-only">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </span>
          </Button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              prefetch="intent"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  collapsed && "justify-center",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
              {/* Always render label text — visually hidden when collapsed */}
              <span className={collapsed ? "sr-only" : ""}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t p-3 space-y-3">
          <div className={cn("flex", collapsed ? "justify-center" : "")}>
            <ThemeChanger />
          </div>

          {!collapsed && (
            <div className="px-1" aria-label={`Signed in as ${user.name}`}>
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:hover:text-red-300",
              collapsed
                ? "w-full justify-center"
                : "w-full justify-start gap-2",
            )}
            onClick={() => logout.mutate()}
          >
            <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
            {/* Always render label text — visually hidden when collapsed */}
            <span className={collapsed ? "sr-only" : ""}>Log out</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
