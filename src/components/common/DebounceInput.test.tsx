import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DebounceInput } from "@/components/common/DebounceInput";

// 알린 값을 그대로 value로 돌려주고, 바깥에서 값을 바꿀 수도 있는 부모
function Controlled({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("나무");
  return (
    <>
      <DebounceInput
        aria-label='이름'
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
      <button onClick={() => setValue("탁자")}>바깥에서 바꾸기</button>
    </>
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("DebounceInput", () => {
  it("입력을 멈추고 500ms가 지나면 마지막 값으로 한 번만 알린다(지우기 버튼도 같다)", () => {
    const onChange = vi.fn();
    render(<DebounceInput aria-label='이름' allowClear onChange={onChange} />);
    const input = screen.getByLabelText("이름");

    fireEvent.change(input, { target: { value: "나" } });
    act(() => vi.advanceTimersByTime(300));
    fireEvent.change(input, { target: { value: "나무" } });
    act(() => vi.advanceTimersByTime(499));
    expect(input).toHaveValue("나무");
    expect(onChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("나무");

    fireEvent.click(screen.getByRole("button", { name: "지우기" }));
    expect(input).toHaveValue("");
    act(() => vi.advanceTimersByTime(500));
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("알린 값이 돌아오면 그대로 두고, 바깥에서 바뀌면 입력창을 맞추고 기다리던 입력은 버린다", () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    const input = screen.getByLabelText("이름");
    expect(input).toHaveValue("나무");

    fireEvent.change(input, { target: { value: "의자" } });
    act(() => vi.advanceTimersByTime(500));
    expect(onChange).toHaveBeenCalledWith("의자");
    expect(input).toHaveValue("의자");

    fireEvent.change(input, { target: { value: "의자 다리" } });
    fireEvent.click(screen.getByText("바깥에서 바꾸기"));
    expect(input).toHaveValue("탁자");
    act(() => vi.advanceTimersByTime(500));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
