import { LogOut, User, User2 } from "lucide-react";
import { Form, NavLink } from "react-router";
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

export function UserNav() {
  const user = useUser();
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
              <User className="mr-2 h-4 w-4" />
              <span>Diary</span>
            </NavLink>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <NavLink
              to="/preview"
              prefetch="intent"
              className={({ isActive }) => (isActive ? "underline" : "")}
            >
              <User className="mr-2 h-4 w-4" />
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
          <Form method="post" action="/logout">
            <button type="submit" className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
