import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  saveArticle: vi.fn(),
  isArticleSaved: vi.fn(),
}));
vi.mock("../actions", () => actions);

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { SaveButton } from "./save-button";

const snapshot = {
  url: "https://stephango.com/saw",
  title: "Use the saw, fear the saw",
  author: "Steph Ango",
  published: "2025-10-20T00:00:00+00:00",
  site: "stephango.com",
  content: "A saw is a useful tool.",
};

beforeEach(() => {
  vi.clearAllMocks();
  actions.isArticleSaved.mockResolvedValue(false);
  actions.saveArticle.mockResolvedValue({ ok: true });
});

describe("SaveButton", () => {
  it("로그아웃 상태면 '로그인하고 저장'이 로그인 후 같은 URL을 다시 변환해 저장하는 주소로 간다", () => {
    render(<SaveButton snapshot={snapshot} signedIn={false} />);

    const link = screen.getByRole("link", { name: "로그인하고 저장" });
    const next = new URL(link.getAttribute("href")!, "http://x").searchParams.get("next")!;
    const back = new URL(next, "http://x");
    expect(new URL(link.getAttribute("href")!, "http://x").pathname).toBe("/auth/login");
    expect(back.pathname).toBe("/");
    expect(back.searchParams.get("url")).toBe(snapshot.url);
    expect(back.searchParams.get("save")).toBe("1");
    expect(actions.isArticleSaved).not.toHaveBeenCalled();
  });

  it("저장을 누르면 스냅샷을 저장하고 '저장됨'으로 바뀌며 목록으로 가는 토스트를 띄운다", async () => {
    render(<SaveButton snapshot={snapshot} signedIn />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "저장" }));

    expect(actions.saveArticle).toHaveBeenCalledWith(snapshot);
    expect(await screen.findByRole("button", { name: "저장됨" })).toBeVisible();
    expect(toast.success).toHaveBeenCalledWith(
      "저장했습니다",
      expect.objectContaining({ description: snapshot.title, action: expect.objectContaining({ label: "저장한 글 보기" }) })
    );
  });

  it("저장하는 동안 버튼은 비활성화되고 '저장 중…'으로 바뀐다", async () => {
    let finish!: (v: { ok: true }) => void;
    actions.saveArticle.mockReturnValue(new Promise((r) => (finish = r)));
    render(<SaveButton snapshot={snapshot} signedIn />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "저장" }));

    expect(screen.getByRole("button", { name: "저장 중…" })).toBeDisabled();
    finish({ ok: true });
    expect(await screen.findByRole("button", { name: "저장됨" })).toBeEnabled();
  });

  it("이미 저장한 URL이면 처음부터 '저장됨'이고, 다시 누르면 지금 내용으로 바꿨다고 알린다", async () => {
    actions.isArticleSaved.mockResolvedValue(true);
    render(<SaveButton snapshot={snapshot} signedIn />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "저장됨" }));

    expect(actions.saveArticle).toHaveBeenCalledWith(snapshot);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "저장한 글을 지금 변환한 내용으로 바꿨습니다",
        expect.objectContaining({ description: snapshot.title })
      )
    );
  });

  it("로그인 후 돌아온 자동 저장은 아직 저장하지 않은 글만 한 번 저장한다", async () => {
    const { rerender } = render(<SaveButton snapshot={snapshot} signedIn autoSave />);

    expect(await screen.findByRole("button", { name: "저장됨" })).toBeVisible();
    rerender(<SaveButton snapshot={snapshot} signedIn autoSave />);
    expect(actions.saveArticle).toHaveBeenCalledTimes(1);
  });

  it("자동 저장이라도 이미 저장한 글이면 다시 저장하지 않는다", async () => {
    actions.isArticleSaved.mockResolvedValue(true);
    render(<SaveButton snapshot={snapshot} signedIn autoSave />);

    expect(await screen.findByRole("button", { name: "저장됨" })).toBeVisible();
    expect(actions.saveArticle).not.toHaveBeenCalled();
  });
});
