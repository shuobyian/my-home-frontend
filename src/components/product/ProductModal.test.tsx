import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { ProductModal } from "@/components/product/ProductModal";
import { createProduct } from "@/test/fixtures";
import { CategoryType, ToolType } from "@/types/enums";
import { UIProvider } from "@/ui";

function openProductModal(onSubmit: () => Promise<void>) {
  const onClose = vi.fn();
  render(
    <UIProvider>
      <ProductModal
        product={createProduct()}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </UIProvider>
  );
  return onClose;
}

// 모달 바깥(마스크) 클릭. 마스크에는 역할·이름이 없어 대화상자의 부모로 찾는다.
function clickOutside() {
  // eslint-disable-next-line testing-library/no-node-access -- 마스크는 접근성 트리에 없다
  const mask = screen.getByRole("dialog").parentElement;
  if (!mask) throw new Error("모달이 열려 있지 않습니다");
  fireEvent.mouseDown(mask);
  fireEvent.click(mask);
}

function pressEscape() {
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
}

describe("ProductModal", () => {
  it("열리면 바로 입력할 수 있게 물품명 입력에 포커스를 둔다", async () => {
    openProductModal(() => Promise.resolve());

    await waitFor(() =>
      expect(
        screen.getAllByRole("textbox", { name: "물품명" })[0]
      ).toHaveFocus()
    );
  });

  it("필수 칸은 라벨을 숨겨도 필수임을 보조 기술에 알린다", () => {
    openProductModal(() => Promise.resolve());

    for (const field of [
      ...screen.getAllByRole("textbox", { name: "물품명" }),
      screen.getByRole("spinbutton", { name: "레벨" }),
      screen.getByRole("spinbutton", { name: "크래프팅 가격" }),
      screen.getByRole("combobox", { name: "도구" }),
      screen.getByRole("combobox", { name: "카테고리" }),
      screen.getByRole("radiogroup", { name: "하위재료 여부" }),
      screen.getByRole("spinbutton", { name: "개수" }),
    ]) {
      expect(field).toHaveAttribute("aria-required", "true");
    }
  });

  it("평소에는 바깥 클릭이나 Esc로 닫힌다", () => {
    const onClose = openProductModal(() => Promise.resolve());

    clickOutside();
    expect(onClose).toHaveBeenCalledTimes(1);

    pressEscape();
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("저장 중에는 바깥 클릭·Esc로 닫히지 않고, 저장이 끝나면 닫힌다", async () => {
    let finish: () => void = () => {};
    const onClose = openProductModal(
      () => new Promise<void>((resolve) => (finish = resolve))
    );

    const submitButton = screen.getByRole("button", { name: "수정" });
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(submitButton).toHaveAttribute("aria-busy", "true")
    );

    clickOutside();
    pressEscape();
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => finish());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("빈 칸이 있으면 오류를 보여 주고, 다 채우면 재료 줄 상태를 뺀 값으로 제출한다", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    render(
      <UIProvider>
        <ProductModal onSubmit={onSubmit} onClose={vi.fn()} />
      </UIProvider>
    );
    const submit = () =>
      fireEvent.click(screen.getByRole("button", { name: "추가" }));
    const change = (element: HTMLElement, value: string) =>
      fireEvent.change(element, { target: { value } });

    submit();
    expect(
      await screen.findByText("정보를 다시 확인해주세요")
    ).toBeInTheDocument();
    expect(screen.getAllByText("물품명을 입력해주세요")).toHaveLength(2);
    for (const message of [
      "레벨을 입력해주세요",
      "크래프팅 가격을 입력해주세요",
      "도구를 선택해주세요",
      "카테고리를 선택해주세요",
      "개수를 입력해주세요",
    ]) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
    expect(onSubmit).not.toHaveBeenCalled();

    const [name, materialName] = screen.getAllByRole("textbox", {
      name: "물품명",
    });
    change(name, "의,자");
    expect(
      screen.getByText("이름에 쉼표(,)는 쓸 수 없습니다")
    ).toBeInTheDocument();
    change(name, "의자");
    change(screen.getByRole("spinbutton", { name: "레벨" }), "3");
    change(screen.getByRole("spinbutton", { name: "크래프팅 가격" }), "500");
    change(screen.getByRole("combobox", { name: "도구" }), ToolType.WOOD);
    change(
      screen.getByRole("combobox", { name: "카테고리" }),
      CategoryType.NORMAL
    );
    change(materialName, "원목");
    change(screen.getByRole("spinbutton", { name: "개수" }), "0");
    expect(screen.getByText("개수는 0보다 커야 합니다")).toBeInTheDocument();
    change(screen.getByRole("spinbutton", { name: "개수" }), "2");

    // 재료 줄을 늘렸다가 지운다
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getAllByRole("spinbutton", { name: "개수" })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getAllByRole("spinbutton", { name: "개수" })).toHaveLength(1);

    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        name: "의자",
        level: 3,
        craftingPrice: 500,
        tool: ToolType.WOOD,
        category: CategoryType.NORMAL,
        materials: [{ name: "원목", basic: true, count: 2 }],
      })
    );
  });
});
