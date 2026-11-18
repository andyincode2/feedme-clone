"use client";

import type { Ref } from "react";
import { LinkIcon, Loader2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INVALID_MESSAGE =
  "http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요.";

export function UrlForm({
  value,
  busy,
  invalid,
  inputRef,
  onChange,
  onSubmit,
  onClear,
}: {
  value: string;
  busy: boolean;
  invalid: boolean;
  inputRef: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <LinkIcon className="pointer-events-none absolute top-3 left-3 size-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/article"
            aria-label="웹 페이지 URL"
            aria-invalid={invalid}
            aria-describedby={invalid ? "url-error" : undefined}
            className="h-10 pr-10 pl-9"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="지우기"
              title="지우기"
              className="absolute top-1 right-1 text-muted-foreground"
              onClick={onClear}
            >
              <XIcon />
            </Button>
          )}
        </div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy && <Loader2Icon className="animate-spin" />}
          {busy ? "변환 중…" : "변환"}
        </Button>
      </div>
      {invalid && (
        <p id="url-error" className="mt-1.5 px-0.5 text-sm text-destructive">
          {INVALID_MESSAGE}
        </p>
      )}
    </form>
  );
}
