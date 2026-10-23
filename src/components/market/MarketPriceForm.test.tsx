import { fireEvent, render, screen } from "@testing-library/react";
import { MarketPriceForm } from "@/components/market/MarketPriceForm";
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

  it("시세가 필수면 빈 칸을 알리고 제출하지 않는다", () => {
    const onSubmit = vi.fn();
    render(
      <MarketPriceForm
        serverMarkets={[wood]}
        requirePrice
        submitText='수정'
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText("원목 시세");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "수정" }));

    expect(screen.getByRole("alert")).toHaveTextContent("시세를 입력해주세요");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
