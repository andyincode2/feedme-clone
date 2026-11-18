import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({ deleteSavedArticle: vi.fn() }));
vi.mock("../actions", () => actions);

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { DeleteSavedArticle } from "./delete-saved-article";

const TITLE = "React 19에서 달라진 폼 처리";

beforeEach(() => {
  vi.clearAllMocks();
  actions.deleteSavedArticle.mockResolvedValue({ ok: true });
});

describe("DeleteSavedArticle", () => {
  it("누르면 제목과 되돌릴 수 없다는 안내가 있는 확인 대화상자를 띄운다", async () => {
    render(<DeleteSavedArticle id={7} title={TITLE} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "삭제" }));

    const dialog = await screen.findByRole("alertdialog", { name: "이 글을 삭제할까요?" });
    expect(dialog).toHaveTextContent(TITLE);
    expect(dialog).toHaveTextContent("되돌릴 수 없");
  });

  it("취소하거나 Esc로 닫으면 아무것도 지우지 않는다", async () => {
    render(<DeleteSavedArticle id={7} title={TITLE} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "삭제" }));
    await user.click(await screen.findByRole("button", { name: "취소" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "삭제" }));
    await screen.findByRole("alertdialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());

    expect(actions.deleteSavedArticle).not.toHaveBeenCalled();
  });

  it("목록에서 삭제를 확인하면 그 글을 지우고 '삭제했습니다'를 알린 뒤 목록을 새로 그린다", async () => {
    render(<DeleteSavedArticle id={7} title={TITLE} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "삭제" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      [...dialog.querySelectorAll("button")].find((b) => b.textContent === "삭제")!
    );

    expect(actions.deleteSavedArticle).toHaveBeenCalledWith(7);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("삭제했습니다", { description: TITLE })
    );
    expect(router.refresh).toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("보기 화면에서 삭제를 확인하면 목록으로 돌아간다", async () => {
    render(<DeleteSavedArticle id={7} title={TITLE} afterDelete="/saved" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "삭제" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      [...dialog.querySelectorAll("button")].find((b) => b.textContent === "삭제")!
    );

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/saved"));
  });
});
