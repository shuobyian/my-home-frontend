import { fireEvent, render, screen } from "@testing-library/react";
import { MarketPriceForm } from "@/components/market/MarketPriceForm";
import { MarketGroupType } from "@/types/enums";
import { Market } from "@/types/market";

const wood: Market = { id: 1, name: "원목", price: 500 };

describe("MarketPriceForm", () => {
  it("마운트 뒤 도착한 시세로 한 번만 채우고, 재조회가 입력값을 덮어쓰지 않는다", () => {
    const onSubmit = vi.fn();
    const props = { submitText: "결과 만들기", onSubmit };
    const { rerender } = render(<MarketPriceForm {...props} />);

    rerender(<MarketPriceForm {...props} serverMarkets={[wood]} />);
    const input = screen.getByLabelText("원목 시세");
    expect(input).toHaveValue("500");
    expect(input).not.toHaveAttribute("aria-required");

    fireEvent.change(input, { target: { value: "700" } });
    rerender(
      <MarketPriceForm {...props} serverMarkets={[{ ...wood, price: 600 }]} />
    );
    expect(input).toHaveValue("700");

    fireEvent.click(screen.getByRole("button", { name: "결과 만들기" }));
    expect(onSubmit).toHaveBeenCalledWith([
      { id: 1, name: "원목", price: 700 },
    ]);
  });
});

describe("MarketPriceForm 저장해 둔 시세로 시작", () => {
  const cloth: Market = { id: 2, name: "천", price: 300 };
  const egg: Market = {
    id: 84,
    name: "이스터 에그",
    price: 0,
    group: MarketGroupType.EVENT,
  };
  const saved: Market[] = [{ ...wood, price: 700 }];
  // 비워 둔 채 저장된 시세(price: null). Market 타입은 아직 null을 담지 못해 단언한다
  const blankCloth = { ...cloth, price: null } as unknown as Market;
  const props = { submitText: "결과 만들기" };

  it("서버 시세가 도착하면 저장본에 없는 재료만 끝에 덧붙이고 알린다", () => {
    const onSubmit = vi.fn();
    const onMarketsAdded = vi.fn();
    const formProps = { ...props, onSubmit, onMarketsAdded };
    const { rerender } = render(
      <MarketPriceForm {...formProps} initialMarkets={saved} />
    );
    expect(screen.queryByLabelText("이스터 에그 시세")).not.toBeInTheDocument();

    rerender(
      <MarketPriceForm
        {...formProps}
        initialMarkets={saved}
        serverMarkets={[wood, cloth, egg]}
      />
    );

    // 이미 있는 재료는 저장해 둔 값(700)을 지키고, 새 재료는 서버 가격을 받는다
    expect(screen.getByLabelText("원목 시세")).toHaveValue("700");
    expect(screen.getByLabelText("천 시세")).toHaveValue("300");
    expect(screen.getByLabelText("이스터 에그 시세")).toHaveValue("0");
    // 화면에는 분류 순서로 묶여 보인다(이스터 에그는 이벤트, 분류가 없는 재료는 마지막 기타)
    expect(
      screen
        .getAllByRole("region")
        .map((group) => group.getAttribute("aria-label"))
    ).toEqual(["이벤트", "기타"]);
    expect(
      screen
        .getAllByRole("listitem")
        .map((card) => card.firstChild?.textContent)
    ).toEqual(["이스터 에그", "원목", "천"]);
    expect(onMarketsAdded).toHaveBeenCalledTimes(1);
    expect(onMarketsAdded).toHaveBeenCalledWith([cloth, egg]);

    fireEvent.click(screen.getByRole("button", { name: "결과 만들기" }));
    expect(onSubmit).toHaveBeenCalledWith([
      { id: 1, name: "원목", price: 700 },
      cloth,
      egg,
    ]);
  });

  it("입력 중인 값과 비워 둔 칸을 서버 시세가 덮어쓰지 않는다", () => {
    const { rerender } = render(
      <MarketPriceForm
        {...props}
        initialMarkets={[wood, blankCloth]}
        onSubmit={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("원목 시세"), {
      target: { value: "900" },
    });

    rerender(
      <MarketPriceForm
        {...props}
        initialMarkets={[wood, blankCloth]}
        serverMarkets={[wood, cloth, egg]}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByLabelText("원목 시세")).toHaveValue("900");
    expect(screen.getByLabelText("천 시세")).toHaveValue("");
    expect(screen.getByLabelText("이스터 에그 시세")).toHaveValue("0");
  });

  it("한 번만 덧붙이고, 이후 재조회는 표를 바꾸지 않는다", () => {
    const onMarketsAdded = vi.fn();
    const formProps = {
      ...props,
      initialMarkets: saved,
      onSubmit: vi.fn(),
      onMarketsAdded,
    };
    const { rerender } = render(
      <MarketPriceForm {...formProps} serverMarkets={[wood, egg]} />
    );
    fireEvent.change(screen.getByLabelText("이스터 에그 시세"), {
      target: { value: "5" },
    });

    rerender(
      <MarketPriceForm
        {...formProps}
        serverMarkets={[wood, { ...egg, price: 9 }, cloth]}
      />
    );

    expect(screen.getByLabelText("이스터 에그 시세")).toHaveValue("5");
    expect(screen.queryByLabelText("천 시세")).not.toBeInTheDocument();
    expect(onMarketsAdded).toHaveBeenCalledTimes(1);
  });

  it("덧붙일 재료가 없으면 알리지 않는다", () => {
    const onMarketsAdded = vi.fn();
    render(
      <MarketPriceForm
        {...props}
        initialMarkets={saved}
        serverMarkets={[wood]}
        onSubmit={vi.fn()}
        onMarketsAdded={onMarketsAdded}
      />
    );

    expect(screen.getByLabelText("원목 시세")).toHaveValue("700");
    expect(onMarketsAdded).not.toHaveBeenCalled();
  });

  it("저장본이 없으면 서버 시세로 채우고 덧붙였다고 알리지 않는다", () => {
    const onMarketsAdded = vi.fn();
    const { rerender } = render(
      <MarketPriceForm
        {...props}
        onSubmit={vi.fn()}
        onMarketsAdded={onMarketsAdded}
      />
    );

    rerender(
      <MarketPriceForm
        {...props}
        serverMarkets={[wood, egg]}
        onSubmit={vi.fn()}
        onMarketsAdded={onMarketsAdded}
      />
    );

    expect(screen.getByLabelText("원목 시세")).toHaveValue("500");
    expect(screen.getByLabelText("이스터 에그 시세")).toHaveValue("0");
    expect(onMarketsAdded).not.toHaveBeenCalled();
  });

  it("관리자가 이름을 바꾼 시세(같은 id)는 새 재료로 덧붙이지 않고, 입력값을 지킨 채 새 이름으로 바꾼다", () => {
    const onSubmit = vi.fn();
    const onMarketsAdded = vi.fn();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const formProps = { ...props, onSubmit, onMarketsAdded };
    const savedWood = { id: 1, name: "나무", price: 99 };
    const { rerender } = render(
      <MarketPriceForm {...formProps} initialMarkets={[savedWood]} />
    );

    rerender(
      <MarketPriceForm
        {...formProps}
        initialMarkets={[savedWood]}
        serverMarkets={[{ ...wood, price: 10 }]}
      />
    );

    expect(
      screen
        .getAllByRole("listitem")
        .map((card) => card.firstChild?.textContent)
    ).toEqual(["원목"]);
    expect(screen.getByLabelText("원목 시세")).toHaveValue("99");
    expect(onMarketsAdded).not.toHaveBeenCalled();
    // 같은 id의 행이 둘이 되지 않는다(React key 중복 경고가 없다)
    expect(errors).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "결과 만들기" }));
    expect(onSubmit).toHaveBeenCalledWith([{ id: 1, name: "원목", price: 99 }]);
  });

  it("저장본의 분류는 서버 시세(같은 id)를 따르고, 제출할 때 함께 넘긴다", () => {
    const onSubmit = vi.fn();
    const formProps = { ...props, onSubmit, initialMarkets: saved };
    const { rerender } = render(<MarketPriceForm {...formProps} />);
    const expectWoodIn = (name: string) =>
      expect(screen.getByRole("region", { name })).toContainElement(
        screen.getByLabelText("원목 시세")
      );
    // 서버 시세가 오기 전에는 저장본의 분류(없으면 기타)로 보인다
    expectWoodIn("기타");

    rerender(
      <MarketPriceForm
        {...formProps}
        serverMarkets={[{ ...wood, group: MarketGroupType.TIMBER }]}
      />
    );
    expectWoodIn("목재");

    fireEvent.click(screen.getByRole("button", { name: "결과 만들기" }));
    expect(onSubmit).toHaveBeenCalledWith([
      { id: 1, name: "원목", price: 700, group: MarketGroupType.TIMBER },
    ]);
  });

  it("'서버 시세 불러오기'는 지금처럼 서버 시세 전체로 바꾼다", () => {
    render(
      <MarketPriceForm
        {...props}
        initialMarkets={saved}
        serverMarkets={[wood, egg]}
        onSubmit={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "서버 시세 불러오기" }));

    expect(screen.getByLabelText("원목 시세")).toHaveValue("500");
  });
});
