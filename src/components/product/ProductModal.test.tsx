import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { ProductModal } from "@/components/product/ProductModal";
import { CatalogNames } from "@/domain/catalog";
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

  // 새 재료 줄은 하위재료 여부를 고르지 않은 채로 시작하도록 바뀌었다(이전에는 최하위재료가 기본값).
  // 시세에 없는 이름이 최하위재료로 저장되는 일을 막으려고 직접 고르게 한다.
  it("빈 칸(하위재료 여부 포함)이 있으면 오류를 보여 주고, 다 채우면 재료 줄 상태를 뺀 값으로 제출한다", async () => {
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
      "하위재료 여부를 선택해주세요",
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
    fireEvent.click(screen.getByRole("radio", { name: "최하위재료" }));
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
      expect(onSubmit).toHaveBeenCalledWith(
        {
          name: "의자",
          level: 3,
          craftingPrice: 500,
          tool: ToolType.WOOD,
          category: CategoryType.NORMAL,
          materials: [{ name: "원목", basic: true, count: 2 }],
        },
        []
      )
    );
  });
});

describe("ProductModal 재료 참조", () => {
  // 시세: 원목·천, 물품: 판자·식탁
  const names: CatalogNames = {
    markets: new Set(["원목", "천"]),
    products: new Set(["판자", "식탁"]),
  };

  function renderModal({
    requireNewMarketPrices,
  }: { requireNewMarketPrices?: boolean } = {}) {
    const onSubmit = vi.fn(() => Promise.resolve());
    render(
      <UIProvider>
        <ProductModal
          catalogNames={names}
          requireNewMarketPrices={requireNewMarketPrices}
          onSubmit={onSubmit}
          onClose={vi.fn()}
        />
      </UIProvider>
    );
    return { onSubmit };
  }

  const change = (element: HTMLElement, value: string) =>
    fireEvent.change(element, { target: { value } });
  // 이름 후보(list)가 붙은 입력은 역할이 combobox라 라벨로 찾는다. 첫 칸은 물품 자신의 이름이다
  const materialName = (index: number) =>
    screen.getAllByLabelText("물품명")[index + 1];
  const count = (index: number) =>
    screen.getAllByRole("spinbutton", { name: "개수" })[index];
  const basicRadio = (index: number, label: "하위재료 O" | "최하위재료") =>
    screen.getAllByRole("radio", { name: label })[index];
  const submit = () =>
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

  // 재료 줄을 뺀 칸을 채운다
  function fillProduct() {
    change(screen.getAllByLabelText("물품명")[0], "반지");
    change(screen.getByRole("spinbutton", { name: "레벨" }), "3");
    change(screen.getByRole("spinbutton", { name: "크래프팅 가격" }), "500");
    change(screen.getByRole("combobox", { name: "도구" }), ToolType.WOOD);
    change(
      screen.getByRole("combobox", { name: "카테고리" }),
      CategoryType.NORMAL
    );
  }
  const product = {
    name: "반지",
    level: 3,
    craftingPrice: 500,
    tool: ToolType.WOOD,
    category: CategoryType.NORMAL,
  };

  it("재료 이름 칸에 시세·물품 이름을 후보로 붙인다", () => {
    renderModal();

    const list = screen.getByRole("listbox", { hidden: true });
    expect(materialName(0)).toHaveAttribute("list", list.id);
    expect(
      within(list)
        .getAllByRole("option", { hidden: true })
        .map((option) => [
          option.getAttribute("value"),
          option.getAttribute("label"),
        ])
    ).toEqual([
      ["원목", "시세"],
      ["천", "시세"],
      ["판자", "물품"],
      ["식탁", "물품"],
    ]);
  });

  it("시세·물품 이름을 받지 않으면 후보와 참조 안내가 없다", () => {
    render(
      <UIProvider>
        <ProductModal onSubmit={vi.fn()} onClose={vi.fn()} />
      </UIProvider>
    );

    change(materialName(0), "은");
    fireEvent.click(basicRadio(0, "최하위재료"));

    expect(materialName(0)).not.toHaveAttribute("list");
    expect(
      screen.queryByText("시세에 없는 새 재료입니다.")
    ).not.toBeInTheDocument();
  });

  it("이름으로 하위재료 여부를 정해 주고, 직접 고른 뒤에는 바꾸지 않는다", () => {
    renderModal();

    change(materialName(0), "판자");
    expect(basicRadio(0, "하위재료 O")).toBeChecked();
    change(materialName(0), "원목");
    expect(basicRadio(0, "최하위재료")).toBeChecked();
    // 이름만으로 정할 수 없으면(시세·물품 어디에도 없음) 그대로 둔다
    change(materialName(0), "은");
    expect(basicRadio(0, "최하위재료")).toBeChecked();

    fireEvent.click(basicRadio(0, "하위재료 O"));
    change(materialName(0), "원목");
    expect(basicRadio(0, "하위재료 O")).toBeChecked();
    expect(
      screen.getByText("시세 재료 이름입니다. '최하위재료'로 바꾸세요.")
    ).toBeInTheDocument();
  });

  it("시세에 없는 새 재료는 시세 칸을 필수로 받아 newMarkets로 넘긴다", async () => {
    const { onSubmit } = renderModal({ requireNewMarketPrices: true });
    fillProduct();
    change(materialName(0), "은");
    fireEvent.click(basicRadio(0, "최하위재료"));
    change(count(0), "2");
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    change(materialName(1), "원목");
    change(count(1), "1");

    expect(screen.getByText("시세에 없는 새 재료입니다.")).toBeInTheDocument();
    const price = screen.getByRole("spinbutton", { name: "새 시세: 은" });
    expect(price).toHaveAttribute("aria-required", "true");

    submit();
    expect(await screen.findByText("시세를 입력해주세요")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    change(price, "300");
    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          ...product,
          materials: [
            { name: "은", basic: true, count: 2 },
            { name: "원목", basic: true, count: 1 },
          ],
        },
        [{ name: "은", price: 300 }]
      )
    );
  });

  it("서버가 거절할 참조는 이름 칸 오류로 제출을 막는다", async () => {
    const { onSubmit } = renderModal({ requireNewMarketPrices: true });
    fillProduct();
    fireEvent.click(basicRadio(0, "하위재료 O"));
    change(materialName(0), "천");
    change(count(0), "1");
    const message = "시세 재료 이름입니다. '최하위재료'로 바꾸세요.";
    expect(screen.getByText(message)).toBeInTheDocument();

    submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(message);
    // 같은 안내를 두 번 보여 주지 않는다
    expect(screen.getAllByText(message)).toHaveLength(1);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(basicRadio(0, "최하위재료"));
    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { ...product, materials: [{ name: "천", basic: true, count: 1 }] },
        []
      )
    );
  });

  it("requireNewMarketPrices가 아니면 참조 문제를 경고로만 보여 주고 그대로 제출한다", async () => {
    const { onSubmit } = renderModal();
    fillProduct();
    change(materialName(0), "은");
    fireEvent.click(basicRadio(0, "최하위재료"));
    change(count(0), "1");
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    fireEvent.click(basicRadio(1, "하위재료 O"));
    change(materialName(1), "천");
    change(count(1), "1");

    expect(screen.getByText("시세에 없는 새 재료입니다.")).toBeInTheDocument();
    expect(
      screen.getByText("시세 재료 이름입니다. '최하위재료'로 바꾸세요.")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: "새 시세: 은" })
    ).not.toBeInTheDocument();

    submit();
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          ...product,
          materials: [
            { name: "은", basic: true, count: 1 },
            { name: "천", basic: false, count: 1 },
          ],
        },
        []
      )
    );
  });
});
