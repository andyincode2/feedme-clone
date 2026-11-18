import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";

test("홈 화면은 FeedMe 헤더, 안내 제목, 빈 화면, 저장하지 않는다는 문구를 보여 준다", () => {
  render(<Home />);

  expect(screen.getByText("FeedMe")).toBeInTheDocument();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "웹 페이지를 Markdown으로 바꿔 LLM에 바로 넘기세요",
    })
  ).toBeInTheDocument();
  expect(screen.getByText("아직 변환한 페이지가 없습니다")).toBeInTheDocument();
  expect(
    screen.getByText("입력한 URL과 프롬프트는 저장하지 않습니다.")
  ).toBeInTheDocument();
});
