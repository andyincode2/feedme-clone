import { expect, test } from "@playwright/test";

test("홈 화면에 헤더, 안내 제목, 빈 화면, 저장 정책 문구가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("FeedMe");
  await expect(page.getByRole("link", { name: "FeedMe" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "웹 페이지를 Markdown으로 바꿔"
  );
  await expect(page.getByText("아직 변환한 페이지가 없습니다")).toBeVisible();
  await expect(
    page.getByText("저장 버튼을 누른 글만 내 계정에 저장합니다. 프롬프트는 저장하지 않습니다.")
  ).toBeVisible();
});
