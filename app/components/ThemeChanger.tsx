import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useRootLoaderData } from "~/hooks/useRootLoaderData";
import type { ThemeType } from "~/server/theme.server";
import { trpc } from "~/utils/trpc";

function applyThemeToDom(theme: ThemeType) {
  const cl = document.documentElement.classList;
  cl.remove("dark", "light", "system");

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    cl.add(prefersDark ? "dark" : "light");
  } else {
    cl.add(theme);
  }
}

export default function ThemeChanger() {
  const { currentTheme } = useRootLoaderData();
  const [theme, setTheme] = useState<ThemeType>(currentTheme);

  const setThemeMutation = trpc.theme.setTheme.useMutation({
    onSuccess: ({ theme: newTheme }) => {
      setTheme(newTheme);
      applyThemeToDom(newTheme);
      toast.success(`Theme changed to ${newTheme}`);
    },
  });

  const handleSelect = (newTheme: ThemeType) => {
    setThemeMutation.mutate({ theme: newTheme });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={theme === "light"}
          onClick={() => handleSelect("light")}
        >
          Light
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "dark"}
          onClick={() => handleSelect("dark")}
        >
          Dark
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "system"}
          onClick={() => handleSelect("system")}
        >
          System
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
