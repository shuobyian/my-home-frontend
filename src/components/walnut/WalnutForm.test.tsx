import { fireEvent, render, screen } from "@testing-library/react";
import { WalnutForm } from "@/components/walnut/WalnutForm";
import { MAX_LEVEL, WALNUT_MIN_LEVEL } from "@/domain/experience";

const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "계산하기" }));

const presentLevel = () => screen.getByLabelText("현재 레벨");
const type = (input: HTMLElement, value: string) =>
  fireEvent.change(input, { target: { value } });

describe("WalnutForm", () => {
  it("첫 제출 전에는 어긋난 값을 넣어도 오류를 보이지 않는다", () => {
    render(<WalnutForm onSubmit={vi.fn()} />);

    type(screen.getByLabelText("생산 경험치 버프 비율(%)"), "120");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(presentLevel()).not.toHaveAttribute("aria-invalid");

    submit();
    expect(screen.getByText("현재 레벨을 입력해주세요.")).toBeInTheDocument();
    expect(screen.getByText("0~100 사이로 입력해주세요.")).toBeInTheDocument();
  });

  it("제출 뒤 값을 고치면 그 칸의 오류만 사라진다", () => {
    render(<WalnutForm onSubmit={vi.fn()} />);
    type(screen.getByLabelText("생산 경험치 버프 비율(%)"), "120");
    submit();
    expect(presentLevel()).toHaveAttribute("aria-invalid", "true");

    type(presentLevel(), "60");

    expect(
      screen.queryByText("현재 레벨을 입력해주세요.")
    ).not.toBeInTheDocument();
    expect(presentLevel()).not.toHaveAttribute("aria-invalid");
    expect(screen.getByText("0~100 사이로 입력해주세요.")).toBeInTheDocument();
  });

  it("한 칸에서 규칙이 여러 개 어긋나면 필수 → 정수 → 범위 순으로 하나만 보인다", () => {
    render(<WalnutForm onSubmit={vi.fn()} />);
    const integerMessage = "정수로 입력해주세요.";
    const rangeMessage = `현재 레벨은 ${WALNUT_MIN_LEVEL}~${MAX_LEVEL - 1} 사이여야 합니다.`;

    submit();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "현재 레벨을 입력해주세요."
    );

    // 정수도 아니고 범위도 벗어난다
    type(presentLevel(), "1.5");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent(integerMessage);
    expect(screen.queryByText(rangeMessage)).not.toBeInTheDocument();

    type(presentLevel(), "30");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent(rangeMessage);
  });

  it("조건이 바뀌면 입력창을 맞추고, 같은 조건이면 고치던 값을 그대로 둔다", () => {
    const onSubmit = vi.fn();
    const { rerender } = render(
      <WalnutForm
        initialValues={{ presentLevel: 60, objectiveLevel: 70 }}
        onSubmit={onSubmit}
      />
    );
    type(screen.getByLabelText("현재 경험치"), "5");

    // 값이 같은 새 객체는 바뀐 조건이 아니다
    rerender(
      <WalnutForm
        initialValues={{ presentLevel: 60, objectiveLevel: 70 }}
        onSubmit={onSubmit}
      />
    );
    expect(screen.getByLabelText("현재 경험치")).toHaveValue("5");

    rerender(
      <WalnutForm initialValues={{ presentLevel: 61 }} onSubmit={onSubmit} />
    );
    expect(presentLevel()).toHaveValue("61");
    expect(screen.getByLabelText("현재 경험치")).toHaveValue("");
    expect(screen.getByLabelText("목표 레벨")).toHaveValue("");

    rerender(<WalnutForm onSubmit={onSubmit} />);
    expect(presentLevel()).toHaveValue("");
  });

  it("제출하면 규칙에 어긋난 항목마다 메시지를 보여 주고 보내지 않는다", () => {
    const onSubmit = vi.fn();
    render(<WalnutForm onSubmit={onSubmit} />);

    submit();
    expect(screen.getByText("현재 레벨을 입력해주세요.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("현재 레벨"), {
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
    expect(screen.getByLabelText("현재 레벨")).toHaveAttribute(
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
