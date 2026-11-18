import Link from "next/link";
import { Suspense, type ReactNode } from "react";

/** Centered card layout shared by the login and sign-up pages. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center text-[15px] font-semibold"
        >
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-md bg-primary font-mono text-[11px] text-primary-foreground"
          >
            md
          </span>
          FeedMe
        </Link>
        {/* The forms read ?next= from the URL. */}
        <Suspense>{children}</Suspense>
      </div>
    </main>
  );
}
