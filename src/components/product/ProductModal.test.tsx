import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { App } from "antd";
import { ProductModal } from "@/components/product/ProductModal";
import { createProduct } from "@/test/fixtures";

function renderModal(onSubmit: () => Promise<void>) {
  const onClose = vi.fn();
  render(
    <App>
      <ProductModal
        product={createProduct()}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </App>
  );
  return onClose;
}

// 모달 바깥(마스크) 클릭. 마스크에는 역할·이름이 없어 클래스로 찾는다.
function clickOutside() {
  // eslint-disable-next-line testing-library/no-node-access -- 마스크는 접근성 트리에 없다
  const wrap = document.querySelector(".ant-modal-wrap");
  if (!wrap) throw new Error("모달이 열려 있지 않습니다");
  fireEvent.mouseDown(wrap);
  fireEvent.click(wrap);
}

function pressEscape() {
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
}

describe("ProductModal", () => {
  it("평소에는 바깥 클릭이나 Esc로 닫힌다", () => {
    const onClose = renderModal(() => Promise.resolve());

    clickOutside();
    expect(onClose).toHaveBeenCalledTimes(1);

    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("저장 중에는 바깥 클릭·Esc로 닫히지 않고, 저장이 끝나면 닫힌다", async () => {
    let finish: () => void = () => {};
    const onClose = renderModal(
      () => new Promise<void>((resolve) => (finish = resolve))
    );

    const submitButton = screen.getByRole("button", { name: /수\s?정/ });
    fireEvent.click(submitButton);
    await waitFor(() => expect(submitButton).toHaveClass("ant-btn-loading"));

    clickOutside();
    pressEscape();
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => finish());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
