import Link from "next/link";
import { BookmarkIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/features/theme";
import type { CurrentUser } from "@/lib/supabase/current-user";
import { cn } from "@/lib/utils";

export function AppHeader({
  user,
  current,
}: {
  user: CurrentUser | null;
  current?: "saved";
}) {
  const initial = (user?.displayName?.trim() || user?.email || "?").charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between py-1">
      <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">
        <span
          aria-hidden
          className="grid size-6 place-items-center rounded-md bg-primary font-mono text-[11px] text-primary-foreground"
        >
          md
        </span>
        FeedMe
      </Link>
      <div className="flex items-center gap-1">
        {user ? (
          <>
            <Link
              href="/saved"
              aria-current={current === "saved" ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                current === "saved" && "bg-muted"
              )}
            >
              <BookmarkIcon data-icon="inline-start" />
              저장한 글
            </Link>
            <Link
              href="/settings"
              aria-label="설정"
              title={`설정 (${user.email})`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold">
                {initial}
              </span>
            </Link>
          </>
        ) : (
          <Link href="/auth/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
            로그인
          </Link>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
