"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

// The server can't know the theme, so both icons and labels render and
// the `.dark` class picks one — no hydration mismatch, no flash.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <MoonIcon className="dark:hidden" />
      <SunIcon className="hidden dark:block" />
      <span className="sr-only dark:hidden">다크 모드로 전환</span>
      <span className="sr-only hidden dark:inline">라이트 모드로 전환</span>
    </Button>
  );
}
