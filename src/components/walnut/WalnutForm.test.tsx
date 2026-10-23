import { fireEvent, render, screen } from "@testing-library/react";
import { WalnutForm } from "@/components/walnut/WalnutForm";

const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "계산하기" }));

describe("WalnutForm", () => {
  it("제출하면 규칙에 어긋난 항목마다 메시지를 보여 주고 보내지 않는다", () => {
    const onSubmit = vi.fn();
    render(<WalnutForm onSubmit={onSubmit} />);

    submit();
    expect(screen.getByText("현재 레벨을 입력해주세요.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("현재 레벨 (필수)"), {
      target: { value: "60" },
    });
    fireEvent.change(screen.getByLabelText("목표 레벨"), {
      target: { value: "60" },
    });
    fireEvent.change(screen.getByLabelText("생산 경험치 버프 비율(%)"), {
      target: { value: "120" },
    });
    expect(
      screen.getByText("목표 레벨은 현재 레벨보다 커야 합니다.")
    ).toBeInTheDocument();
    expect(screen.getByText("0~100 사이로 입력해주세요.")).toBeInTheDocument();

    submit();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("처음 값을 채우고, 입력하지 않은 선택 항목은 빼고 보낸다", () => {
    const onSubmit = vi.fn();
    render(
      <WalnutForm
        initialValues={{ presentLevel: 60, objectiveLevel: 70 }}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByLabelText("목표 레벨")).toHaveValue("70");
    expect(screen.getByLabelText("현재 레벨 (필수)")).toHaveAttribute(
      "aria-required",
      "true"
    );

    submit();

    expect(onSubmit).toHaveBeenCalledWith({
      presentLevel: 60,
      objectiveLevel: 70,
    });
  });
});
