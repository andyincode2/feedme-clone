import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Article, ConvertResponse } from "@/features/conversion";

import { ConverterScreen } from "./converter-screen";

// The save button navigates with the App Router, which these tests don't mount.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const SHORT: Article = {
  url: "https://stephango.com/saw",
  title: "Use the saw, fear the saw",
  author: "Steph Ango",
  published: "2025-10-20T00:00:00+00:00",
  site: "stephango.com",
  content: "A saw is a useful tool.\n\n## Respect the tool\n\n- Keep clear",
};
const NO_AUTHOR: Article = { ...SHORT, author: "", published: "" };
// "# title\n\n출처: url\n\n" adds ~65 chars; this body lands just under 4,000.
const NEAR_LIMIT: Article = { ...SHORT, content: "a".repeat(3925) };

let responses: ConvertResponse[];
let fetchMock: ReturnType<typeof vi.fn>;
let pending: ((r: Response) => void) | null;
const writeText = vi.fn(async () => {});
const openMock = vi.fn();

function respond(...next: ConvertResponse[]) {
  responses = next;
}

beforeEach(() => {
  responses = [];
  pending = null;
  fetchMock = vi.fn(
    () =>
      new Promise<Response>((resolve) => {
        const body = responses.shift();
        if (body) resolve(Response.json(body));
        else pending = resolve;
      })
  );
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("open", openMock);
});

// userEvent.setup() swaps in its own clipboard stub, so attach ours after it.
function setupUser() {
  const user = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  return user;
}

afterEach(() => {
  vi.unstubAllGlobals();
  writeText.mockClear();
  openMock.mockClear();
});

async function convert(url: string) {
  const user = setupUser();
  const input = screen.getByRole("textbox", { name: "웹 페이지 URL" });
  await user.clear(input);
  await user.type(input, `${url}{Enter}`);
  return user;
}

describe("입력과 리셋", () => {
  it("입력값이 있을 때만 지우기 버튼이 보인다", async () => {
    render(<ConverterScreen />);
    const user = setupUser();
    expect(screen.queryByRole("button", { name: "지우기" })).toBeNull();

    await user.type(screen.getByRole("textbox", { name: "웹 페이지 URL" }), "h");
    expect(screen.getByRole("button", { name: "지우기" })).toBeVisible();

    await user.clear(screen.getByRole("textbox", { name: "웹 페이지 URL" }));
    expect(screen.queryByRole("button", { name: "지우기" })).toBeNull();
  });

  it("지우기를 누르면 결과와 프롬프트가 사라지고 빈 화면으로 돌아가 입력칸에 포커스가 간다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });
    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.type(
      screen.getByRole("textbox", { name: "직접 입력한 프롬프트" }),
      "표로"
    );

    await user.click(screen.getByRole("button", { name: "지우기" }));

    const input = screen.getByRole("textbox", { name: "웹 페이지 URL" });
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(screen.queryByRole("heading", { name: SHORT.title })).toBeNull();
    expect(screen.queryByRole("textbox", { name: "직접 입력한 프롬프트" })).toBeNull();
    expect(screen.getByText("아직 변환한 페이지가 없습니다")).toBeVisible();
  });

  it("변환 버튼으로도 변환을 시작한다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = setupUser();
    await user.type(
      screen.getByRole("textbox", { name: "웹 페이지 URL" }),
      SHORT.url
    );
    await user.click(screen.getByRole("button", { name: "변환" }));

    expect(await screen.findByRole("heading", { name: SHORT.title })).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith("/api/convert", expect.objectContaining({
      body: JSON.stringify({ url: SHORT.url }),
    }));
  });
});

describe("변환", () => {
  it("http(s)://로 시작하지 않으면 서버에 요청하지 않고 오류를 보여 준다", async () => {
    render(<ConverterScreen />);
    await convert("velog.io/@hanul good commit");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        "http:// 또는 https://로 시작하는 웹 페이지 주소를 입력해 주세요."
      )
    ).toBeVisible();
    expect(screen.getByRole("textbox", { name: "웹 페이지 URL" })).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("변환하는 동안 버튼은 비활성화되고 '변환 중…'으로 바뀌며 스켈레톤이 보인다", async () => {
    render(<ConverterScreen />);
    await convert(SHORT.url);

    expect(screen.getByRole("button", { name: "변환 중…" })).toBeDisabled();
    expect(screen.getByLabelText("변환 중")).toHaveAttribute("aria-busy", "true");

    await act(async () => pending?.(Response.json({ status: "ok", article: SHORT })));
    expect(await screen.findByRole("button", { name: "변환" })).toBeEnabled();
  });

  it("가져오지 못하면 오류와 다시 시도를 보여 주고, 다시 시도는 같은 URL로 변환한다", async () => {
    respond({ status: "fetch_failed", httpStatus: 403 }, { status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);

    expect(await screen.findByText("페이지를 가져오지 못했습니다")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByRole("heading", { name: SHORT.title })).toBeVisible();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].body).toBe(JSON.stringify({ url: SHORT.url }));
    expect(screen.queryByText("페이지를 가져오지 못했습니다")).toBeNull();
  });

  it("추출된 본문이 비어 있으면 본문 없음 안내를 보여 준다", async () => {
    respond({ status: "empty" });
    render(<ConverterScreen />);
    await convert("https://www.naver.com");

    expect(await screen.findByText("추출할 본문을 찾지 못했습니다")).toBeVisible();
  });
});

describe("결과 확인", () => {
  it("제목과 메타 줄을 보여 주고, 비어 있는 항목은 줄에서 뺀다", async () => {
    respond({ status: "ok", article: NO_AUTHOR });
    render(<ConverterScreen />);
    await convert(SHORT.url);

    await screen.findByRole("heading", { name: SHORT.title });
    expect(screen.queryByText("Steph Ango")).toBeNull();
    expect(screen.getByText("stephango.com")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Respect the tool", level: 2 })).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveTextContent("Keep clear");
  });
});

describe("프롬프트", () => {
  it("칩은 하나만 고를 수 있고, 다시 누르면 선택이 풀린다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });

    const summary = screen.getByRole("button", { name: "요약해줘" });
    const translate = screen.getByRole("button", { name: "한국어로 번역해줘" });
    await user.click(summary);
    await user.click(translate);
    expect(summary).toHaveAttribute("aria-pressed", "false");
    expect(translate).toHaveAttribute("aria-pressed", "true");

    await user.click(translate);
    expect(translate).toHaveAttribute("aria-pressed", "false");
  });

  it("직접 입력을 고르면 입력칸이 포커스를 받고, 다른 칩을 고르면 입력칸과 내용이 사라진다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });

    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    const custom = screen.getByRole("textbox", { name: "직접 입력한 프롬프트" });
    expect(custom).toHaveFocus();
    await user.type(custom, "표로 정리해줘");

    await user.click(screen.getByRole("button", { name: "요약해줘" }));
    expect(screen.queryByRole("textbox", { name: "직접 입력한 프롬프트" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    expect(screen.getByRole("textbox", { name: "직접 입력한 프롬프트" })).toHaveValue("");
  });

  it("새 페이지를 변환하면 프롬프트 선택이 초기화된다", async () => {
    respond({ status: "ok", article: SHORT }, { status: "ok", article: NO_AUTHOR });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });
    await user.click(screen.getByRole("button", { name: "요약해줘" }));

    await convert("https://stephango.com/other");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await screen.findByRole("heading", { name: SHORT.title });

    expect(screen.getByRole("button", { name: "요약해줘" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});

describe("내보내기와 LLM 전달", () => {
  it("복사하기는 프롬프트 없이 Markdown만 복사하고 버튼이 '복사했습니다'로 바뀐다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });
    await user.click(screen.getByRole("button", { name: "요약해줘" }));

    await user.click(screen.getByRole("button", { name: "복사하기" }));

    expect(writeText).toHaveBeenCalledWith(
      `# ${SHORT.title}\n\n출처: ${SHORT.url}\n\n${SHORT.content}`
    );
    expect(await screen.findByRole("button", { name: "복사했습니다" })).toBeVisible();
  });

  it("4,000자 이하면 프롬프트 + 빈 줄 + Markdown을 ?q=에 담아 새 탭을 연다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });
    await user.click(screen.getByRole("button", { name: "요약해줘" }));

    await user.click(screen.getByRole("button", { name: "Claude로 열기" }));

    const text = `요약해줘\n\n# ${SHORT.title}\n\n출처: ${SHORT.url}\n\n${SHORT.content}`;
    expect(openMock).toHaveBeenCalledWith(
      `https://claude.ai/new?q=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it("프롬프트로 4,000자를 넘기면 안내가 바로 보이고, 누르면 클립보드에 복사한 뒤 새 대화 화면을 연다", async () => {
    respond({ status: "ok", article: NEAR_LIMIT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });
    const note = /본문이 길어 URL에 담을 수 없습니다/;
    expect(screen.queryByText(note)).toBeNull();

    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.type(
      screen.getByRole("textbox", { name: "직접 입력한 프롬프트" }),
      "핵심 주장 세 가지를 표로 정리해줘"
    );
    expect(screen.getByText(note)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "ChatGPT로 열기" }));
    expect(writeText).toHaveBeenCalledWith(
      expect.stringMatching(/^핵심 주장 세 가지를 표로 정리해줘\n\n# /)
    );
    expect(openMock).toHaveBeenCalledWith(
      "https://chatgpt.com/",
      "_blank",
      "noopener,noreferrer"
    );

    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    expect(screen.queryByText(note)).toBeNull();
  });

  it("직접 입력이 비어 있으면 탭을 열지 않고 입력칸에 포커스를 준다", async () => {
    respond({ status: "ok", article: SHORT });
    render(<ConverterScreen />);
    const user = await convert(SHORT.url);
    await screen.findByRole("heading", { name: SHORT.title });
    await user.click(screen.getByRole("button", { name: "직접 입력" }));
    await user.click(screen.getByRole("button", { name: "복사하기" }));

    await user.click(screen.getByRole("button", { name: "ChatGPT로 열기" }));

    expect(openMock).not.toHaveBeenCalled();
    expect(screen.getByRole("textbox", { name: "직접 입력한 프롬프트" })).toHaveFocus();
  });
});
