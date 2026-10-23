import { fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "@/components/common/SearchBar";

describe("SearchBar", () => {
  it("검색 버튼이나 Enter로 앞뒤 공백을 지운 검색어를 넘긴다", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("물품명 입력");

    fireEvent.change(input, { target: { value: "  나무 의자 " } });
    fireEvent.click(screen.getByRole("button", { name: /검\s?색/ }));
    expect(onSearch).toHaveBeenLastCalledWith("나무 의자");

    fireEvent.change(input, { target: { value: "탁자" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter", keyCode: 13 });
    expect(onSearch).toHaveBeenLastCalledWith("탁자");
  });

  it("지우기 버튼을 누르면 빈 검색어(전체)로 검색한다", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("물품명 입력");

    fireEvent.change(input, { target: { value: "탁자" } });
    fireEvent.click(screen.getByRole("button", { name: "지우기" }));

    expect(input).toHaveValue("");
    expect(onSearch).toHaveBeenLastCalledWith("");
  });
});
