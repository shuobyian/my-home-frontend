import { fireEvent, render, screen, within } from "@testing-library/react";
import { ResultCards } from "@/components/result/ResultCards";
import { createResult } from "@/test/fixtures";

const results = Array.from({ length: 13 }, (_, index) =>
  createResult({ id: index + 1, name: `물품 ${index + 1}` })
);

const cardNames = () =>
  within(screen.getByRole("list", { name: "결과 목록" }))
    .getAllByRole("heading")
    .map((heading) => heading.textContent);

describe("ResultCards", () => {
  it("쪽을 나누지 않고 결과를 모두 보여 준다", () => {
    render(<ResultCards loading={false} contents={results} />);

    expect(cardNames()).toHaveLength(13);
    expect(
      screen.queryByRole("navigation", { name: "페이지 이동" })
    ).not.toBeInTheDocument();
  });

  it("상세 창에서 담으면 onAdd로 알리고 창을 닫는다", () => {
    const onAdd = vi.fn();
    render(
      <ResultCards loading={false} contents={[results[0]]} onAdd={onAdd} />
    );

    fireEvent.click(screen.getByRole("button", { name: "물품 1 상세" }));
    const dialog = screen.getByRole("dialog", { name: "물품 1" });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "장바구니에 담기" })
    );

    expect(onAdd).toHaveBeenCalledWith(results[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
