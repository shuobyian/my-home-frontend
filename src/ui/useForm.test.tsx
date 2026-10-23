import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { Field } from "./Field";
import { Input } from "./Input";
import { FormErrors, useForm } from "./useForm";

interface Values {
  name: string;
}

function NameForm({
  onValid,
  onInvalid,
}: {
  onValid: (values: Values) => void;
  onInvalid: (errors: FormErrors) => void;
}) {
  const { values, errors, set, handleSubmit } = useForm<Values>(
    { name: "" },
    ({ name }) => ({ name: name.trim() ? undefined : "물품명을 입력해주세요" })
  );

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)}>
      <Field label='물품명' help='쉼표는 쓸 수 없습니다' error={errors.name}>
        <Input value={values.name} onChange={(value) => set("name", value)} />
      </Field>
      <Button type='submit'>저장</Button>
    </form>
  );
}

describe("useForm + Field", () => {
  test("제출 전에는 오류를 숨기고, 실패한 제출 뒤에는 값이 바뀔 때마다 다시 검증한다", () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();
    render(<NameForm onValid={onValid} onInvalid={onInvalid} />);
    const input = screen.getByLabelText("물품명");
    const help = screen.getByText("쉼표는 쓸 수 없습니다");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).toHaveAttribute("aria-describedby", help.id);

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onInvalid).toHaveBeenCalledWith({ name: "물품명을 입력해주세요" });
    expect(onValid).not.toHaveBeenCalled();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("물품명을 입력해주세요");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", `${help.id} ${alert.id}`);

    fireEvent.change(input, { target: { value: "나무 의자" } });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-invalid");

    fireEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(onValid).toHaveBeenCalledWith({ name: "나무 의자" });
    expect(onInvalid).toHaveBeenCalledTimes(1);
  });

  test("필수 표시(*)는 라벨 이름에 섞이지 않고 aria-required로 알린다", () => {
    render(
      <Field label='레벨' required>
        <Input />
      </Field>
    );

    expect(screen.getByRole("textbox", { name: "레벨" })).toHaveAttribute(
      "aria-required",
      "true"
    );
  });
});
