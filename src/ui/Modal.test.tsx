import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps, StrictMode, useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { Modal } from "./Modal";

function openModal(props: Partial<ComponentProps<typeof Modal>> = {}) {
  const onClose = vi.fn();
  render(
    <Modal
      open
      title='물품 추가'
      onClose={onClose}
      footer={<button type='button'>저장</button>}
      {...props}
    >
      <input aria-label='이름' />
    </Modal>
  );
  return onClose;
}

// 마스크는 접근성 트리에 없어 대화상자의 부모로 찾는다
function clickMask() {
  // eslint-disable-next-line testing-library/no-node-access
  const mask = screen.getByRole("dialog").parentElement;
  if (!mask) throw new Error("마스크가 없습니다");
  fireEvent.mouseDown(mask);
  fireEvent.click(mask);
}

describe("Modal", () => {
  test("제목으로 이름 붙은 대화상자이고 Esc·바깥 클릭·닫기 버튼으로 닫힌다", () => {
    const onClose = openModal();
    const dialog = screen.getByRole("dialog", { name: "물품 추가" });
    expect(dialog).toHaveAttribute("aria-modal", "true");

    fireEvent.keyDown(dialog, { key: "Escape" });
    clickMask();
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));

    expect(onClose).toHaveBeenCalledTimes(3);
  });

  test("dismissible=false면 닫히지 않는다", () => {
    const onClose = openModal({ dismissible: false });

    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    clickMask();

    expect(screen.getByRole("button", { name: "닫기" })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("대화상자 안에서 누르고 바깥에서 놓으면 닫히지 않는다", () => {
    const onClose = openModal();

    fireEvent.mouseDown(screen.getByRole("textbox", { name: "이름" }));
    // eslint-disable-next-line testing-library/no-node-access
    fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
  });

  test("autoFocus 자식의 포커스를 지킨다(StrictMode 포함)", () => {
    const page = (open: boolean) => (
      <StrictMode>
        <button type='button'>열기</button>
        <Modal open={open} title='물품 추가' onClose={() => {}}>
          {/* eslint-disable-next-line jsx-a11y-x/no-autofocus */}
          <input aria-label='이름' autoFocus />
        </Modal>
      </StrictMode>
    );
    const { rerender } = render(page(false));
    screen.getByRole("button", { name: "열기" }).focus();

    rerender(page(true));

    expect(screen.getByRole("textbox", { name: "이름" })).toHaveFocus();
  });

  test("열리면 대화상자에 포커스를 두고, 닫히면 연 버튼으로 돌려준다", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type='button' onClick={() => setOpen(true)}>
            열기
          </button>
          <Modal open={open} title='제목' onClose={() => setOpen(false)}>
            내용
          </Modal>
        </>
      );
    }
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "열기" });
    trigger.focus();

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("Tab·Shift+Tab은 대화상자 안에서 돈다", () => {
    openModal();
    const close = screen.getByRole("button", { name: "닫기" });
    const save = screen.getByRole("button", { name: "저장" });

    save.focus();
    fireEvent.keyDown(save, { key: "Tab" });
    expect(close).toHaveFocus();

    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(save).toHaveFocus();
  });

  test("포커스가 대화상자 밖(body)으로 빠져도 Tab은 안으로 돌아오고 Esc로 닫힌다", () => {
    const onClose = openModal();
    // 포커스된 버튼이 지워진 경우처럼 body로 보낸다
    screen.getByRole("dialog").blur();

    fireEvent.keyDown(document.body, { key: "Tab" });
    expect(screen.getByRole("button", { name: "닫기" })).toHaveFocus();

    screen.getByRole("button", { name: "닫기" }).blur();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("겹쳐 열리면 Esc는 맨 위 대화상자만 닫는다", () => {
    const first = vi.fn();
    const second = vi.fn();
    render(
      <>
        <Modal open title='첫째' onClose={first} />
        <Modal open title='둘째' onClose={second} />
      </>
    );

    fireEvent.keyDown(screen.getByRole("dialog", { name: "둘째" }), {
      key: "Escape",
    });

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  test("위 겹이 Esc로 곧바로 닫혀도 아래 겹은 같은 Esc로 닫히지 않는다", () => {
    const first = vi.fn();
    function Harness({ tick }: { tick: number }) {
      const [secondOpen, setSecondOpen] = useState(true);
      // 위 겹은 같은 onClose를 유지하고, 실제 브라우저처럼 리스너 사이에 커밋되게 한다
      const [closeSecond] = useState(
        // eslint-disable-next-line @eslint-react/dom-no-flush-sync
        () => () => flushSync(() => setSecondOpen(false))
      );
      // tick이 바뀌면 새 onClose라 아래 겹의 리스너만 위 겹보다 뒤에 다시 붙는다
      const closeFirst = useCallback(() => first(tick), [tick]);
      return (
        <>
          <Modal open title='첫째' onClose={closeFirst} />
          <Modal open={secondOpen} title='둘째' onClose={closeSecond} />
        </>
      );
    }
    const { rerender } = render(<Harness tick={0} />);
    rerender(<Harness tick={1} />);

    // act 안에서는 effect 정리가 리스너 사이에 돌지 않으므로 act 밖에서 보낸다
    const env = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const actEnvironment = env.IS_REACT_ACT_ENVIRONMENT;
    env.IS_REACT_ACT_ENVIRONMENT = false;
    try {
      screen.getByRole("dialog", { name: "둘째" }).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        })
      );
    } finally {
      env.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
    }

    expect(
      screen.queryByRole("dialog", { name: "둘째" })
    ).not.toBeInTheDocument();
    expect(first).not.toHaveBeenCalled();
  });

  test("포커스가 배경으로 나가면 대화상자로 되돌리고, 위에 새로 열린 겹의 autoFocus는 지킨다", () => {
    const page = (second: boolean) => (
      <>
        <button type='button'>배경</button>
        <Modal open title='첫째' onClose={() => {}} />
        <Modal open={second} title='둘째' onClose={() => {}}>
          {/* eslint-disable-next-line jsx-a11y-x/no-autofocus */}
          <input aria-label='이름' autoFocus />
        </Modal>
      </>
    );
    const { rerender } = render(page(false));

    screen.getByRole("button", { name: "배경" }).focus();
    expect(screen.getByRole("dialog", { name: "첫째" })).toHaveFocus();

    rerender(page(true));
    expect(screen.getByRole("textbox", { name: "이름" })).toHaveFocus();

    // 아래 겹도 맨 위 겹의 밖이다
    screen.getByRole("dialog", { name: "첫째" }).focus();
    expect(screen.getByRole("dialog", { name: "둘째" })).toHaveFocus();
  });

  test("여러 겹이 열려도 마지막이 닫힐 때 스크롤 잠금을 푼다(StrictMode 포함)", () => {
    const layers = (first: boolean, second: boolean) => (
      <StrictMode>
        <Modal open={first} title='첫째' onClose={() => {}} />
        <Modal open={second} title='둘째' onClose={() => {}} />
      </StrictMode>
    );
    const { rerender } = render(layers(true, true));
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    rerender(layers(false, true));
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    rerender(layers(false, false));
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });
});
