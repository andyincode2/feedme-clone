import { describe, expect, it } from "vitest";

import {
  articleMarkdown,
  isWebUrl,
  markdownFilename,
  metaItems,
} from "./article";
import type { Article } from "./types";

const article: Article = {
  url: "https://stephango.com/saw",
  title: "Use the saw, fear the saw",
  author: "Steph Ango",
  published: "2025-10-20T00:00:00+00:00",
  site: "stephango.com",
  content: "A saw is a useful tool.",
};

describe("isWebUrl", () => {
  it("http:// 또는 https://로 시작하는 값만 웹 주소로 본다", () => {
    expect(isWebUrl("https://stephango.com/saw")).toBe(true);
    expect(isWebUrl("http://example.com")).toBe(true);
    expect(isWebUrl("velog.io/@hanul good commit")).toBe(false);
    expect(isWebUrl("ftp://example.com")).toBe(false);
    expect(isWebUrl("")).toBe(false);
  });
});

describe("articleMarkdown", () => {
  it("본문 위에 # 제목과 출처 URL 한 줄을 붙인다", () => {
    expect(articleMarkdown(article)).toBe(
      "# Use the saw, fear the saw\n\n출처: https://stephango.com/saw\n\nA saw is a useful tool."
    );
  });
});

describe("markdownFilename", () => {
  it("제목에서 파일 이름에 쓸 수 없는 문자를 빼고 공백을 -로 바꾼다", () => {
    expect(markdownFilename({ ...article, title: 'A/B: "test" <draft>?' })).toBe(
      "AB-test-draft.md"
    );
    expect(markdownFilename(article)).toBe("Use-the-saw,-fear-the-saw.md");
  });

  it("제목이 비어 있으면 도메인을 쓴다", () => {
    expect(markdownFilename({ ...article, title: "  " })).toBe(
      "stephango.com.md"
    );
  });
});

describe("metaItems", () => {
  it("저자, 게시일, 사이트(원문 링크), 글자 수 순서로 보여 준다", () => {
    expect(metaItems(article, 1486)).toEqual([
      { label: "Steph Ango" },
      { label: "2025년 10월 20일" },
      { label: "stephango.com", href: "https://stephango.com/saw" },
      { label: "1,486자" },
    ]);
  });

  it("값이 비어 있는 항목은 뺀다", () => {
    expect(
      metaItems({ ...article, author: "", published: "" }, 912)
    ).toEqual([
      { label: "stephango.com", href: "https://stephango.com/saw" },
      { label: "912자" },
    ]);
  });
});
