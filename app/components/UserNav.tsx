import { LogOut, Notebook, ScanEye, User, User2 } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import useUser from "~/hooks/useUser";
import { trpc } from "~/utils/trpc";

export function UserNav() {
  const user = useUser();
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User2 className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">User nav</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <NavLink
              to="/diary"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              <Notebook className="mr-2 h-4 w-4" />
              <span>Diary</span>
            </NavLink>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <NavLink
              to="/preview"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              <ScanEye className="mr-2 h-4 w-4" />
              <span>Preview</span>
            </NavLink>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <NavLink
              to="/profile"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 dark:text-red-400" asChild>
          <button
            type="button"
            className="flex items-center"
            onClick={() => {
              logout.mutate();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
