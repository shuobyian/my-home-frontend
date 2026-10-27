import { act, fireEvent, render, screen } from "@testing-library/react";
import { SearchBar } from "@/components/common/SearchBar";

afterEach(() => {
  vi.useRealTimers();
});

describe("SearchBar", () => {
  it("버튼 없이 입력을 멈추면 앞뒤 공백을 지운 검색어로 검색한다", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByPlaceholderText("물품명 입력"), {
      target: { value: "  나무 의자 " },
    });
    act(() => vi.advanceTimersByTime(500));

    expect(onSearch).toHaveBeenCalledWith("나무 의자");
    expect(screen.queryByRole("button", { name: /검\s?색/ })).toBeNull();
  });
});
