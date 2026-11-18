"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkIcon, CheckIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";

import { isArticleSaved, saveArticle } from "../actions";
import type { ArticleSnapshot } from "../types";

/** Login, then come back to the converter with this URL and save it. */
function loginToSaveHref(url: string) {
  const back = `/?url=${encodeURIComponent(url)}&save=1`;
  return `/auth/login?next=${encodeURIComponent(back)}`;
}

export function SaveButton({
  snapshot,
  signedIn,
  autoSave = false,
}: {
  snapshot: ArticleSnapshot;
  signedIn: boolean;
  /** Save right away unless already saved (returning from "로그인하고 저장"). */
  autoSave?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const autoSaved = useRef(false);

  async function save(replacing: boolean) {
    setStatus("saving");
    const result = await saveArticle(snapshot);
    if (!result.ok) {
      setStatus(replacing ? "saved" : "idle");
      toast.error("저장하지 못했습니다", { description: "잠시 후 다시 시도해 주세요." });
      return;
    }
    setStatus("saved");
    if (replacing) {
      toast.success("저장한 글을 지금 변환한 내용으로 바꿨습니다", {
        description: snapshot.title,
      });
    } else {
      toast.success("저장했습니다", {
        description: snapshot.title,
        action: { label: "저장한 글 보기", onClick: () => router.push("/saved") },
      });
    }
  }

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    isArticleSaved(snapshot.url).then((saved) => {
      if (cancelled) return;
      if (saved) setStatus("saved");
      else if (autoSave && !autoSaved.current) {
        autoSaved.current = true;
        save(false);
      }
    });
    return () => {
      cancelled = true;
    };
    // Check once per article; `save` reads the latest snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, snapshot.url, autoSave]);

  if (!signedIn) {
    return (
      <Link href={loginToSaveHref(snapshot.url)} className={buttonVariants({ variant: "outline" })}>
        <BookmarkIcon />
        로그인하고 저장
      </Link>
    );
  }

  return (
    <Button
      variant="outline"
      disabled={status === "saving"}
      className={status === "saved" ? "border-primary dark:border-primary" : undefined}
      title={status === "saved" ? "다시 누르면 지금 변환한 내용으로 바꿔 저장합니다" : undefined}
      onClick={() => save(status === "saved")}
    >
      {status === "saving" ? (
        <Loader2Icon className="animate-spin" />
      ) : status === "saved" ? (
        <CheckIcon />
      ) : (
        <BookmarkIcon />
      )}
      {status === "saving" ? "저장 중…" : status === "saved" ? "저장됨" : "저장"}
    </Button>
  );
}
