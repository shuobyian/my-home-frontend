import { fireEvent, render, screen } from "@testing-library/react";
import { MarketEditor } from "@/components/market/MarketEditor";
import { MarketGroupType } from "@/types/enums";
import { Market } from "@/types/market";
import { ComponentProps } from "react";

const wood: Market = { id: 1, name: "원목", price: 500 };
const cloth: Market = { id: 2, name: "천", price: 300 };
const gold: Market = { id: 3, name: "금", price: 1000 };
const markets = [wood, cloth, gold];
const usage = new Map([
  ["원목", ["의자", "식탁"]],
  ["천", ["방석"]],
  ["금", []],
]);

function renderEditor(
  props: Partial<ComponentProps<typeof MarketEditor>> = {}
) {
  const handlers = { onSubmit: vi.fn(), onDelete: vi.fn() };
  const view = render(
    <MarketEditor markets={markets} usage={usage} {...handlers} {...props} />
  );
  return { ...handlers, ...view };
}

const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const save = () =>
  fireEvent.click(screen.getByRole("button", { name: "저장" }));

describe("MarketEditor", () => {
  it("바뀐 것이 없으면 저장할 수 없고, 바뀐 행만 바뀐 필드로 제출한다", () => {
    const { onSubmit } = renderEditor();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();

    change("원목 시세", "700");
    save();

    expect(onSubmit).toHaveBeenCalledWith([{ id: 1, price: 700 }], []);
  });

  it("행을 추가하면 id 없이 이름·시세로 제출한다", () => {
    const { onSubmit } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "재료 추가" }));
    change("새 재료 1 이름", " 은 ");
    change("새 재료 1 시세", "50");
    save();

    expect(onSubmit).toHaveBeenCalledWith([{ name: "은", price: 50 }], []);
  });

  it("분류를 바꾸면 분류만 제출하고, 카드는 저장할 때까지 저장된 분류의 묶음에 남는다", () => {
    const { onSubmit } = renderEditor({
      markets: [{ ...wood, group: MarketGroupType.TIMBER }, cloth, gold],
    });
    const group = (name: string) => screen.getByRole("region", { name });
    expect(screen.getByLabelText("원목 분류")).toHaveValue("TIMBER");
    expect(group("목재")).toContainElement(screen.getByLabelText("원목 분류"));
    // 분류가 없는 시세는 기타로 보인다
    expect(screen.getByLabelText("천 분류")).toHaveValue("ETC");

    change("천 분류", MarketGroupType.CROP);
    fireEvent.click(screen.getByRole("button", { name: "재료 추가" }));
    change("새 재료 1 이름", "은");
    change("새 재료 1 시세", "50");
    change("새 재료 1 분류", MarketGroupType.MINERAL);
    expect(group("기타")).toContainElement(screen.getByLabelText("천 분류"));
    expect(group("기타")).toContainElement(
      screen.getByLabelText("새 재료 1 분류")
    );
    save();

    expect(onSubmit).toHaveBeenCalledWith(
      [
        { id: 2, group: MarketGroupType.CROP },
        { name: "은", price: 50, group: MarketGroupType.MINERAL },
      ],
      []
    );
  });

  it("이름을 바꾸면 renames를 함께 넘긴다", () => {
    const { onSubmit } = renderEditor();

    change("원목 이름", "참나무");
    save();

    expect(onSubmit).toHaveBeenCalledWith(
      [{ id: 1, name: "참나무" }],
      [{ from: "원목", to: "참나무" }]
    );
  });

  it("빈 이름·쉼표·중복·시세 누락을 알리고 제출하지 않는다", () => {
    const { onSubmit } = renderEditor();

    change("원목 이름", " ");
    change("천 이름", "금,은");
    change("금 시세", "");
    fireEvent.click(screen.getByRole("button", { name: "재료 추가" }));
    change("새 재료 1 이름", "금");
    save();

    expect(screen.getByLabelText("원목 이름")).toHaveAccessibleDescription(
      "이름을 입력해주세요"
    );
    expect(screen.getByLabelText("천 이름")).toHaveAccessibleDescription(
      "이름에 쉼표(,)는 쓸 수 없습니다"
    );
    expect(screen.getByLabelText("금 이름")).toHaveAccessibleDescription(
      "이미 있는 시세 이름입니다"
    );
    expect(screen.getByLabelText("새 재료 1 이름")).toHaveAccessibleDescription(
      "이미 있는 시세 이름입니다"
    );
    expect(screen.getByLabelText("금 시세")).toHaveAccessibleDescription(
      "시세를 입력해주세요"
    );
    expect(screen.getByLabelText("새 재료 1 시세")).toHaveAccessibleDescription(
      "시세를 입력해주세요"
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("쓰는 물품 수를 보여 주고, 쓰는 물품이 없는 저장된 시세만 지울 수 있다", () => {
    const { onDelete } = renderEditor();

    expect(screen.getByTitle("의자, 식탁")).toHaveTextContent("2개");
    expect(screen.getByRole("button", { name: "원목 삭제" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "천 삭제" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "금 삭제" }));
    expect(onDelete).toHaveBeenCalledWith(gold);
  });

  it("사용처를 모르면 '-'로 보여 주고 삭제를 막는다", () => {
    renderEditor({ usage: undefined });

    expect(screen.getAllByText("-")).toHaveLength(3);
    expect(screen.getByRole("button", { name: "금 삭제" })).toBeDisabled();
  });

  it("새 행의 삭제는 목록에서만 뺀다", () => {
    const { onDelete } = renderEditor();

    fireEvent.click(screen.getByRole("button", { name: "재료 추가" }));
    fireEvent.click(screen.getByRole("button", { name: "새 재료 1 삭제" }));

    expect(screen.queryByLabelText("새 재료 1 이름")).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("도착한 시세로 한 번만 채우고, 이후 재조회는 입력값을 두되 지워진 시세는 뺀다", () => {
    const props = { usage, onSubmit: vi.fn(), onDelete: vi.fn() };
    const { rerender } = render(<MarketEditor {...props} />);
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();

    rerender(<MarketEditor {...props} markets={markets} />);
    change("원목 시세", "700");
    rerender(
      <MarketEditor {...props} markets={[{ ...wood, price: 600 }, cloth]} />
    );

    expect(screen.getByLabelText("원목 시세")).toHaveValue("700");
    expect(screen.queryByLabelText("금 시세")).not.toBeInTheDocument();
  });

  it("'시세 불러오기'는 서버 값으로 되돌린다(새 행 포함)", () => {
    renderEditor();
    change("원목 시세", "700");
    fireEvent.click(screen.getByRole("button", { name: "재료 추가" }));

    fireEvent.click(screen.getByRole("button", { name: "시세 불러오기" }));

    expect(screen.getByLabelText("원목 시세")).toHaveValue("500");
    expect(screen.queryByLabelText("새 재료 1 이름")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });
});
