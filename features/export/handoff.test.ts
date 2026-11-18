import { describe, expect, it } from "vitest";

import { handoffPlan, handoffText } from "./handoff";

describe("handoffText", () => {
  it("프롬프트 + 빈 줄 + Markdown을 넘긴다", () => {
    expect(handoffText("요약해줘", "# 제목\n\n본문")).toBe(
      "요약해줘\n\n# 제목\n\n본문"
    );
  });

  it("프롬프트가 없으면 Markdown만 넘긴다", () => {
    expect(handoffText("", "# 제목")).toBe("# 제목");
  });
});

describe("handoffPlan", () => {
  it("4,000자 이하면 ChatGPT의 ?q=에 URL 인코딩해 담는다", () => {
    const text = "요약해줘\n\n# a&b";
    expect(handoffPlan("ChatGPT", text)).toEqual({
      via: "url",
      href: "https://chatgpt.com/?q=%EC%9A%94%EC%95%BD%ED%95%B4%EC%A4%98%0A%0A%23%20a%26b",
    });
  });

  it("정확히 4,000자는 Claude의 ?q=로 넘긴다", () => {
    const text = "a".repeat(4000);
    expect(handoffPlan("Claude", text)).toEqual({
      via: "url",
      href: `https://claude.ai/new?q=${text}`,
    });
  });

  it("4,000자를 넘으면 클립보드로 넘기고 새 대화 화면을 연다", () => {
    const text = "a".repeat(4001);
    expect(handoffPlan("ChatGPT", text)).toEqual({
      via: "clipboard",
      href: "https://chatgpt.com/",
    });
    expect(handoffPlan("Claude", text)).toEqual({
      via: "clipboard",
      href: "https://claude.ai/new",
    });
  });
});
