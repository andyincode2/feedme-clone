import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 안내 제목이 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("FeedMe");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "웹 페이지를 Markdown으로 바꿔"
  );
});
