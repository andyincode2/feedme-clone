"use client";

import { useRef, useState } from "react";

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

type View =
  | { status: "idle" }
  | { status: "invalid" }
  | { status: "loading" }
  | ConvertResponse;

export function ConverterScreen() {
  const [url, setUrl] = useState("");
  const [view, setView] = useState<View>({ status: "idle" });
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

  function clear() {
    requestId.current++;
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
            />
          }
        />
      )}
    </>
  );
}
