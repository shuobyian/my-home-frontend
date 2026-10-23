import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import { silenceExpectedErrors } from "@/test/silenceErrors";
import { UIProvider, useDialogs, useToast } from "./UIProvider";

function setup() {
  const { result } = renderHook(
    () => ({ toast: useToast(), dialogs: useDialogs() }),
    { wrapper: UIProvider }
  );
  return result;
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useToast", () => {
  test("기본 3초 뒤에 사라진다", () => {
    vi.useFakeTimers();
    const ui = setup();

    act(() => ui.current.toast.success("저장했습니다"));
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("저장했습니다");

    act(() => vi.advanceTimersByTime(2999));
    expect(status).toHaveTextContent("저장했습니다");
    act(() => vi.advanceTimersByTime(1));
    expect(status).toBeEmptyDOMElement();
  });

  test("같은 key는 새로 쌓지 않고 내용·종류를 바꾸며 시간을 다시 잰다", () => {
    vi.useFakeTimers();
    const ui = setup();

    act(() =>
      ui.current.toast.success("담았습니다", { key: "cart", duration: 1.5 })
    );
    act(() => vi.advanceTimersByTime(1000));
    act(() =>
      ui.current.toast.error("못 담았습니다", { key: "cart", duration: 1.5 })
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/^못 담았습니다$/);

    act(() => vi.advanceTimersByTime(1000));
    expect(status).toHaveTextContent("못 담았습니다");
    act(() => vi.advanceTimersByTime(500));
    expect(status).toBeEmptyDOMElement();
  });
});

describe("useDialogs", () => {
  test("confirm: 확인 버튼에 포커스를 두고, 동기 onOk면 바로 닫는다", () => {
    const onOk = vi.fn();
    const ui = setup();

    act(() => ui.current.dialogs.confirm({ title: "삭제할까요?", onOk }));
    expect(screen.getByRole("dialog", { name: "삭제할까요?" })).toBeVisible();
    const ok = screen.getByRole("button", { name: "확인" });
    expect(ok).toHaveFocus();

    fireEvent.click(ok);
    expect(onOk).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("confirm: onOk가 Promise면 끝날 때까지 닫지 않고, 실패하면 열린 채 두며 성공하면 닫는다", async () => {
    let settle = { resolve: () => {}, reject: () => {} };
    const onOk = () =>
      new Promise<void>((resolve, reject) => (settle = { resolve, reject }));
    const ui = setup();

    act(() =>
      ui.current.dialogs.confirm({ title: "삭제할까요?", okText: "삭제", onOk })
    );
    const dialog = screen.getByRole("dialog");
    const ok = screen.getByRole("button", { name: "삭제" });

    fireEvent.click(ok);
    expect(ok).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: "취소" })).toBeDisabled();
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(dialog).toBeInTheDocument();

    await act(async () => settle.reject());
    expect(ok).not.toHaveAttribute("aria-busy");
    expect(dialog).toBeInTheDocument();

    fireEvent.click(ok);
    await act(async () => settle.resolve());
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("confirm: okDisabled면 확인할 수 없고, 취소는 onOk 없이 닫는다", () => {
    const onOk = vi.fn();
    const ui = setup();

    act(() =>
      ui.current.dialogs.confirm({
        title: "저장할까요?",
        okDisabled: true,
        onOk,
      })
    );
    expect(screen.getByRole("button", { name: "확인" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onOk).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("alert: 확인 버튼 하나로 닫는다", () => {
    const ui = setup();

    act(() =>
      ui.current.dialogs.alert({
        status: "error",
        title: "가져오지 않았습니다",
        content: "3행: 물품명이 없습니다",
      })
    );
    expect(
      screen.getByRole("dialog", { name: "가져오지 않았습니다" })
    ).toHaveTextContent("3행: 물품명이 없습니다");
    expect(
      screen.queryByRole("button", { name: "취소" })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "확인" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

test("UIProvider 밖에서 훅을 쓰면 오류를 던진다", () => {
  silenceExpectedErrors();

  expect(() => renderHook(() => useToast())).toThrow(
    "useToast는 UIProvider 안에서만 쓸 수 있습니다."
  );
});
