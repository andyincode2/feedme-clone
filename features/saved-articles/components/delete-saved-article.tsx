"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { deleteSavedArticle } from "../actions";

export function DeleteSavedArticle({
  id,
  title,
  afterDelete,
  showLabel = false,
}: {
  id: number;
  title: string;
  /** Where to go once deleted; stays on the page (and refreshes it) when omitted. */
  afterDelete?: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    const result = await deleteSavedArticle(id);
    setDeleting(false);
    if (!result.ok) {
      toast.error("삭제하지 못했습니다", { description: "잠시 후 다시 시도해 주세요." });
      return;
    }
    setOpen(false);
    toast.success("삭제했습니다", { description: title });
    if (afterDelete) router.push(afterDelete);
    else router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size={showLabel ? "sm" : "icon"}
            aria-label={showLabel ? undefined : "삭제"}
            title="삭제"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          />
        }
      >
        <Trash2Icon data-icon={showLabel ? "inline-start" : undefined} />
        {showLabel && "삭제"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>이 글을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription className="break-keep">
            &ldquo;{title}&rdquo;을(를) 저장한 글에서 지웁니다. 지운 글은 되돌릴 수 없고, 다시
            보려면 원문을 다시 변환해 저장해야 합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>취소</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={deleting} onClick={confirm}>
            {deleting && <Loader2Icon className="animate-spin" />}
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
