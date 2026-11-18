import { ThemeToggle } from "@/features/theme";

import { ConverterScreen } from "./converter-screen";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-180 flex-1 flex-col gap-6 px-4 pt-3">
      <header className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2 text-[15px] font-semibold">
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-md bg-primary font-mono text-[11px] text-primary-foreground"
          >
            md
          </span>
          FeedMe
        </div>
        <ThemeToggle />
      </header>

      <div>
        <h1 className="mb-1.5 text-[22px] font-semibold tracking-tight text-balance break-keep sm:text-[26px]">
          웹 페이지를 Markdown으로 바꿔 LLM에 바로 넘기세요
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          URL을 붙여넣으면 광고와 메뉴를 걷어낸 본문만 Markdown으로 뽑아
          드립니다.
        </p>
      </div>

      <ConverterScreen />

      <p className="pt-2 pb-6 text-center text-xs text-muted-foreground">
        입력한 URL과 프롬프트는 저장하지 않습니다.
      </p>
    </main>
  );
}
