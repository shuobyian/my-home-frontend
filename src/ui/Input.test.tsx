import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Field } from "./Field";
import { Input } from "./Input";

function Clearable() {
  const [value, setValue] = useState("사과");
  return (
    <Input aria-label='검색어' allowClear value={value} onChange={setValue} />
  );
}

describe("Input", () => {
  test("지우기 버튼은 값을 비우고 입력에 포커스를 돌려준다", () => {
    render(<Clearable />);
    const input = screen.getByRole("textbox", { name: "검색어" });

    fireEvent.click(screen.getByRole("button", { name: "지우기" }));

    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    // 값이 없으면 지우기 버튼도 없다
    expect(
      screen.queryByRole("button", { name: "지우기" })
    ).not.toBeInTheDocument();
  });

  test("비밀번호는 보기/숨기기 버튼으로 글자를 드러낸다", () => {
    render(<Input type='password' aria-label='비밀번호' />);
    const input = screen.getByLabelText("비밀번호");
    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "비밀번호 보기" }));
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "비밀번호 숨기기" }));
    expect(input).toHaveAttribute("type", "password");
  });

  test("Field 안에서는 호출부가 id를 넘겨도 라벨과 연결된다", () => {
    render(
      <Field label='이름' error='필수입니다'>
        <Input id='custom-id' />
      </Field>
    );
    const input = screen.getByRole("textbox", { name: "이름" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("필수입니다");
  });
});
