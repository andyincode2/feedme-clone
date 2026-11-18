"use client";

import { useRef, useState } from "react";
import {
  CheckIcon,
  ClipboardIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  handoffPlan,
  handoffText,
  URL_HANDOFF_LIMIT,
  type Llm,
} from "./handoff";

const PRESETS = ["요약해줘", "한국어로 번역해줘", "쉽게 설명해줘"];
const CUSTOM = "__custom";
const LLMS: Llm[] = ["ChatGPT", "Claude"];

export function ExportPanel({
  markdown,
  filename,
}: {
  markdown: string;
  filename: string;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);

  const prompt = choice === CUSTOM ? customPrompt.trim() : (choice ?? "");
  const text = handoffText(prompt, markdown);
  const viaClipboard = text.length > URL_HANDOFF_LIMIT;

  function choose(values: string[]) {
    const next = values[0] ?? null;
    setChoice(next);
    if (next !== CUSTOM) setCustomPrompt("");
  }

  async function copy() {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast.success("Markdown을 클립보드에 복사했습니다", {
      description: `${markdown.length.toLocaleString("ko-KR")}자`,
    });
    setTimeout(() => setCopied(false), 2000);
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(href);
    toast.success("파일을 내려받았습니다", { description: filename });
  }

  async function open(llm: Llm) {
    if (choice === CUSTOM && !prompt) {
      customRef.current?.focus();
      toast.info("직접 입력할 프롬프트가 비어 있습니다", {
        description: '내용을 입력하거나 "직접 입력"을 해제해 주세요.',
      });
      return;
    }
    const plan = handoffPlan(llm, text);
    if (plan.via === "clipboard") {
      await navigator.clipboard.writeText(text);
      window.open(plan.href, "_blank", "noopener,noreferrer");
      toast.success(`본문을 복사하고 ${llm}를 새 탭에서 열었습니다`, {
        description: `입력창에 붙여넣어(Ctrl+V) 보내세요.${prompt ? ` 프롬프트 "${prompt}"도 함께 복사됐습니다.` : ""}`,
      });
      return;
    }
    window.open(plan.href, "_blank", "noopener,noreferrer");
    toast.success(`${llm}를 새 탭에서 열었습니다`, {
      description: prompt
        ? `"${prompt}" + 본문이 입력창에 채워져 있습니다.`
        : "본문이 입력창에 채워져 있습니다.",
    });
  }

  return (
    <div className="flex flex-col gap-3.5 bg-muted/50 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "복사했습니다" : "복사하기"}
        </Button>
        <Button variant="outline" onClick={download}>
          <DownloadIcon />
          .md 다운로드
        </Button>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-muted-foreground">
          LLM에 보낼 때 앞에 붙일 프롬프트 (선택)
        </p>
        <ToggleGroup
          aria-label="프롬프트"
          variant="outline"
          size="sm"
          spacing={1.5}
          className="flex-wrap"
          value={choice ? [choice] : []}
          onValueChange={choose}
        >
          {PRESETS.map((preset) => (
            <ToggleGroupItem
              key={preset}
              value={preset}
              className="bg-background dark:not-aria-pressed:bg-input/30 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {preset}
            </ToggleGroupItem>
          ))}
          <ToggleGroupItem
            value={CUSTOM}
            className="bg-background dark:not-aria-pressed:bg-input/30 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            직접 입력
          </ToggleGroupItem>
        </ToggleGroup>
        {choice === CUSTOM && (
          <Input
            ref={customRef}
            autoFocus
            className="mt-2 bg-background"
            placeholder="예: 핵심 주장 세 가지를 표로 정리해줘"
            aria-label="직접 입력한 프롬프트"
            value={customPrompt}
            onChange={(event) => setCustomPrompt(event.target.value)}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {LLMS.map((llm) => (
          <Button key={llm} className="flex-1 sm:flex-none" onClick={() => open(llm)}>
            <ExternalLinkIcon />
            {llm}로 열기
          </Button>
        ))}
      </div>
      {viaClipboard && (
        <p className="flex items-start gap-1.5 text-[13px] leading-snug text-muted-foreground">
          <ClipboardIcon className="mt-px size-3.5 shrink-0" />
          본문이 길어 URL에 담을 수 없습니다. 버튼을 누르면 본문을 클립보드에
          복사한 뒤 새 탭을 엽니다. 입력창에 붙여넣어 보내세요.
        </p>
      )}
    </div>
  );
}
