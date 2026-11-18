import { describe, expect, it } from "vitest";

import { formatSavedAt, formatSavedDate } from "./format";

describe("저장 날짜 표시", () => {
  it("목록에는 한국 시간 기준 날짜를 '2026년 11월 18일' 형식으로 보여 준다", () => {
    expect(formatSavedDate("2026-11-18T07:20:00Z")).toBe("2026년 11월 18일");
    // 23:30 UTC is already the next day in Korea.
    expect(formatSavedDate("2026-11-17T23:30:00Z")).toBe("2026년 11월 18일");
  });

  it("보기 화면에는 '2026년 11월 18일 오후 4:20'처럼 시각까지 보여 준다", () => {
    expect(formatSavedAt("2026-11-18T07:20:00Z")).toBe("2026년 11월 18일 오후 4:20");
    expect(formatSavedAt("2026-11-16T23:05:00Z")).toBe("2026년 11월 17일 오전 8:05");
  });
});
