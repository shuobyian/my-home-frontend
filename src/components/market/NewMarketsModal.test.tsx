import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NewMarketsModal } from "@/components/market/NewMarketsModal";
import { NewMarket } from "@/types/market";
import { UIProvider } from "@/ui";

function renderModal(onSubmit: (markets: NewMarket[]) => Promise<void>) {
  const onClose = vi.fn();
  render(
    <UIProvider>
      <NewMarketsModal
        names={["은", "금"]}
        usedBy={{ 은: ["반지", "목걸이"] }}
        existingNames={new Set(["원목"])}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </UIProvider>
  );
  return { onClose };
}

const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const submit = () =>
  fireEvent.click(screen.getByRole("button", { name: "추가" }));

describe("NewMarketsModal", () => {
  it("이름을 미리 채우고 쓰는 물품을 함께 보여 준다", () => {
    renderModal(() => Promise.resolve());

    expect(screen.getByLabelText("은 이름")).toHaveValue("은");
    expect(screen.getByLabelText("금 이름")).toHaveValue("금");
    expect(screen.getByLabelText("은 시세")).toHaveAttribute(
      "aria-required",
      "true"
    );
    expect(screen.getByText("쓰는 물품: 반지, 목걸이")).toBeInTheDocument();
  });

  it("시세 누락·이름 겹침을 알리고 제출하지 않는다", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    renderModal(onSubmit);

    change("금 이름", "원목");
    change("은 시세", "30");
    submit();

    expect(
      await screen.findByText("정보를 다시 확인해주세요")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("금 이름")).toHaveAccessibleDescription(
      "이미 있는 시세 이름입니다"
    );
    expect(screen.getByLabelText("금 시세")).toHaveAccessibleDescription(
      "시세를 입력해주세요"
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("고친 이름(공백 제거)과 시세로 제출하고 닫는다", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const { onClose } = renderModal(onSubmit);

    change("금 이름", " 금괴 ");
    change("은 시세", "30");
    change("금 시세", "1000");
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith([
      { name: "은", price: 30 },
      { name: "금괴", price: 1000 },
    ]);
  });

  it("저장에 실패하면 입력을 유지한 채 열어 둔다", async () => {
    let fail: () => void = () => {};
    const onSubmit = vi.fn(
      () => new Promise<void>((_, reject) => (fail = () => reject(new Error())))
    );
    const { onClose } = renderModal(onSubmit);
    change("은 시세", "30");
    change("금 시세", "1000");
    submit();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());

    await act(async () => fail());

    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "시세 추가" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("금 시세")).toHaveValue("1000");
    expect(screen.getByRole("button", { name: "추가" })).not.toHaveAttribute(
      "aria-busy",
      "true"
    );
  });
});
