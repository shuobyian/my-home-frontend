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

  it("글자를 직접 다 지워도 빈 검색어(전체)로 검색한다", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByPlaceholderText("물품명 입력");

    fireEvent.change(input, { target: { value: "탁자" } });
    expect(onSearch).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "" } });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("");
  });

  it("검색 버튼을 마우스로 눌러도 입력창 포커스를 그대로 둔다", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    const input = screen.getByPlaceholderText("물품명 입력");
    input.focus();

    // 기본 동작(버튼으로 포커스 이동)을 막으면 false가 돌아온다
    expect(
      fireEvent.mouseDown(screen.getByRole("button", { name: /검\s?색/ }))
    ).toBe(false);
    expect(input).toHaveFocus();
  });

  it("검색창 밖에 포커스가 있으면 버튼을 누를 때 포커스 이동을 막지 않는다", () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(
      fireEvent.mouseDown(screen.getByRole("button", { name: /검\s?색/ }))
    ).toBe(true);
  });
});
