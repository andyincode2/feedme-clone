"use client";

import { useEffect, useRef, useState } from "react";

import {
  ArticleCard,
  articleMarkdown,
  EmptyBodyAlert,
  FetchFailedAlert,
  isWebUrl,
  LoadingCard,
  markdownFilename,
  requestConversion,
  StartEmpty,
  UrlForm,
  type ConvertResponse,
} from "@/features/conversion";
import { ExportPanel } from "@/features/export";
import { SaveButton } from "@/features/saved-articles";

type View =
  | { status: "idle" }
  | { status: "invalid" }
  | { status: "loading" }
  | ConvertResponse;

export function ConverterScreen({
  signedIn = false,
  initialUrl,
  autoSave = false,
}: {
  signedIn?: boolean;
  /** Convert this URL right away (returning from "로그인하고 저장"). */
  initialUrl?: string;
  /** Also save that first result unless it is already saved. */
  autoSave?: boolean;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [autoSaveUrl, setAutoSaveUrl] = useState(autoSave ? initialUrl?.trim() : undefined);
  const [view, setView] = useState<View>(() =>
    !initialUrl ? { status: "idle" } : isWebUrl(initialUrl.trim()) ? { status: "loading" } : { status: "invalid" }
  );
  const inputRef = useRef<HTMLInputElement>(null);
  // Ignores a response that arrives after the user cleared or restarted.
  const requestId = useRef(0);

  async function convert(target: string) {
    const trimmed = target.trim();
    if (!isWebUrl(trimmed)) {
      setView({ status: "invalid" });
      inputRef.current?.focus();
      return;
    }
    const id = ++requestId.current;
    setView({ status: "loading" });
    const result = await requestConversion(trimmed);
    if (id === requestId.current) setView(result);
  }

  // Arriving with ?url= starts in "loading"; fetch that result once.
  useEffect(() => {
    if (!initialUrl) return;
    // Drop ?url=&save= so a refresh doesn't convert and save again.
    window.history.replaceState(null, "", "/");
    if (!isWebUrl(initialUrl.trim())) return;
    const id = ++requestId.current;
    requestConversion(initialUrl.trim()).then((result) => {
      if (id === requestId.current) setView(result);
    });
  }, [initialUrl]);

  function clear() {
    requestId.current++;
    setAutoSaveUrl(undefined);
    setUrl("");
    setView({ status: "idle" });
    inputRef.current?.focus();
  }

  return (
    <>
      <UrlForm
        value={url}
        busy={view.status === "loading"}
        invalid={view.status === "invalid"}
        inputRef={inputRef}
        onChange={(next) => {
          setUrl(next);
          if (view.status === "invalid") setView({ status: "idle" });
        }}
        onSubmit={() => convert(url)}
        onClear={clear}
      />

      {view.status === "idle" && (
        <StartEmpty
          onSample={(sample) => {
            setUrl(sample);
            convert(sample);
          }}
        />
      )}
      {view.status === "loading" && <LoadingCard />}
      {view.status === "fetch_failed" && (
        <FetchFailedAlert
          httpStatus={view.httpStatus}
          onRetry={() => convert(url)}
        />
      )}
      {view.status === "empty" && <EmptyBodyAlert />}
      {view.status === "ok" && (
        <ArticleCard
          article={view.article}
          actions={
            <ExportPanel
              markdown={articleMarkdown(view.article)}
              filename={markdownFilename(view.article)}
              actions={
                <SaveButton
                  snapshot={view.article}
                  signedIn={signedIn}
                  autoSave={autoSaveUrl === view.article.url}
                />
              }
            />
          }
        />
      )}
    </>
  );
}
