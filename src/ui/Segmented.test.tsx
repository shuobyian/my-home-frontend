import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Field } from "./Field";
import { Segmented } from "./Segmented";

const BASIC_OPTIONS = [
  { value: false, label: "하위재료 O" },
  { value: true, label: "최하위재료" },
];

function BasicField({ onChange }: { onChange: (value: boolean) => void }) {
  const [value, setValue] = useState<boolean>(true);
  return (
    <Field label='재료 종류'>
      <Segmented
        value={value}
        options={BASIC_OPTIONS}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
      />
    </Field>
  );
}

describe("Segmented", () => {
  test("Field 라벨로 이름이 붙은 라디오 묶음이고, 글자를 눌러 고른다(boolean 값)", () => {
    const onChange = vi.fn();
    render(<BasicField onChange={onChange} />);

    expect(
      screen.getByRole("radiogroup", { name: "재료 종류" })
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "최하위재료" })).toBeChecked();

    fireEvent.click(screen.getByText("하위재료 O"));

    expect(onChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("radio", { name: "하위재료 O" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "최하위재료" })).not.toBeChecked();
  });

  test("값이 어떤 옵션과도 같지 않으면 아무것도 고르지 않는다", () => {
    render(
      <Segmented
        aria-label='관리 메뉴'
        value='/unknown'
        options={[
          { value: "/manage", label: "Raw 엑셀 데이터" },
          { value: "/manage/product", label: "물품 리스트" },
        ]}
        onChange={() => {}}
      />
    );

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }
  });
});
