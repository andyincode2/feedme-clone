"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateDisplayName, type ProfileFormState } from "./actions";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState<ProfileFormState, FormData>(
    updateDisplayName,
    { status: "idle" }
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <Label htmlFor="displayName">표시 이름</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          placeholder="예: 김하늘"
          maxLength={50}
          className="sm:flex-1"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중…" : "저장"}
        </Button>
      </div>
      {state.status === "saved" && (
        <p role="status" className="text-sm text-muted-foreground">
          표시 이름을 저장했습니다.
        </p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
