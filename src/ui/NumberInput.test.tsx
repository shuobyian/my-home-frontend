import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { Field } from "./Field";
import { NumberInput, NumberInputProps } from "./NumberInput";
import { useForm } from "./useForm";

// 값을 바깥 상태로 들고 있는 일반적인 쓰임
function Controlled({
  initial = null,
  onChange,
  ...props
}: NumberInputProps & { initial?: number | null }) {
  const [value, setValue] = useState(initial);
  return (
    <NumberInput
      aria-label='개수'
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const type = (text: string) =>
  fireEvent.change(screen.getByRole("spinbutton"), {
    target: { value: text },
  });

describe("NumberInput", () => {
  test("입력 중에는 읽은 숫자를 범위 고정 없이 알리고, 빈 칸은 null로 알린다", () => {
    const onChange = vi.fn();
    render(<Controlled max={10} precision={0} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    expect(input).toHaveAttribute("inputmode", "numeric");
    type("15");
    expect(onChange).toHaveBeenLastCalledWith(15);
    expect(input).toHaveAttribute("aria-valuenow", "15");

    // 같은 값을 뜻하는 글자("15.")는 다시 알리지 않고 그대로 둔다
    type("15.");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue("15.");

    type("");
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  test("벗어날 때 범위로 고정하고 자릿수로 반올림한다", () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(
      <Controlled
        min={0}
        max={10}
        precision={1}
        onChange={onChange}
        onBlur={onBlur}
      />
    );
    const input = screen.getByRole("spinbutton");

    type("12.34");
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(input).toHaveValue("10");

    type("3.14159");
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(3.1);
    expect(input).toHaveValue("3.1");
    expect(onBlur).toHaveBeenCalledTimes(2);
  });

  test("읽을 수 없는 글자는 알리지 않고, 벗어나면 현재 값으로 되돌린다", () => {
    const onChange = vi.fn();
    render(<Controlled initial={5} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    type("-");
    expect(input).toHaveValue("-");
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(input).toHaveValue("5");
  });

  test("↑/↓로 step만큼 바꾸고 범위를 넘지 않는다", () => {
    const onChange = vi.fn();
    render(<Controlled initial={9} max={10} step={2} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(input).toHaveValue("10");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(onChange).toHaveBeenLastCalledWith(8);
    expect(input).toHaveValue("8");
  });

  test("바깥 value가 바뀌면 글자를 맞춘다", () => {
    const { rerender } = render(<NumberInput aria-label='개수' value={1} />);
    const input = screen.getByRole("spinbutton");

    rerender(<NumberInput aria-label='개수' value={7} />);
    expect(input).toHaveValue("7");

    // NaN을 받아도 렌더가 끝없이 반복되지 않는다
    rerender(<NumberInput aria-label='개수' value={NaN} />);

    rerender(<NumberInput aria-label='개수' value={null} />);
    expect(input).toHaveValue("");
  });

  test("value 없이 써도 입력한 값을 기준으로 ↑/↓·벗어남을 처리한다", () => {
    const onChange = vi.fn();
    render(<NumberInput aria-label='개수' onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    type("5");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveValue("6");

    type("-");
    fireEvent.blur(input);
    expect(input).toHaveValue("6");
    expect(onChange.mock.calls).toEqual([[5], [6]]);
  });

  test("Enter로 제출할 때 범위 고정·반올림한 값을 낸다", () => {
    const onValid = vi.fn();
    function CountForm() {
      const { values, set, handleSubmit } = useForm(
        { count: null as number | null },
        () => ({})
      );
      return (
        <form onSubmit={handleSubmit(onValid)}>
          <NumberInput
            aria-label='개수'
            value={values.count}
            onChange={(value) => set("count", value)}
            min={0}
            max={10}
            precision={0}
          />
        </form>
      );
    }
    render(<CountForm />);
    const input = screen.getByRole("spinbutton");

    type("12.7");
    // 브라우저의 암묵적 제출처럼 Enter keydown 뒤에 submit이 온다
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.submit(input);
    expect(onValid).toHaveBeenCalledWith({ count: 10 });
    expect(input).toHaveValue("10");
  });

  test("Field·useForm 안에서 값을 주고받고, 단위를 보이며, 검증 실패를 표시한다", () => {
    const onValid = vi.fn();
    function PriceForm() {
      const { values, errors, set, handleSubmit } = useForm(
        { price: null as number | null },
        (v) => ({ price: v.price == null ? "시세를 입력해주세요" : undefined })
      );
      return (
        <form onSubmit={handleSubmit(onValid)}>
          <Field label='시세' error={errors.price}>
            <NumberInput
              value={values.price}
              onChange={(value) => set("price", value)}
              min={0}
              suffix='골드'
            />
          </Field>
          <button type='submit'>저장</button>
        </form>
      );
    }
    render(<PriceForm />);
    const input = screen.getByLabelText("시세");

    expect(screen.getByText("골드")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(screen.getByRole("alert")).toHaveTextContent("시세를 입력해주세요");
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.change(input, { target: { value: "120" } });
    expect(input).not.toHaveAttribute("aria-invalid");
    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    expect(onValid).toHaveBeenCalledWith({ price: 120 });
  });

  test("ref를 prop으로 받아 실제 입력 요소에 연결한다", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput aria-label='개수' suffix='개' ref={ref} />);

    act(() => ref.current?.focus());
    expect(screen.getByLabelText("개수")).toHaveFocus();
  });
});
