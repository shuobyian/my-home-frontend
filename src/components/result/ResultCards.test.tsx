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
  it("클라이언트 페이지: 12개씩 나누고, 쪽당 개수를 늘리면 한 쪽에 모두 보인다", () => {
    render(<ResultCards loading={false} contents={results} />);

    expect(cardNames()).toHaveLength(12);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(cardNames()).toEqual(["물품 13"]);

    fireEvent.change(screen.getByRole("combobox", { name: "페이지당 개수" }), {
      target: { value: "24" },
    });
    expect(cardNames()).toHaveLength(13);
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
