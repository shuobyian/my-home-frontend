import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AddMarketModal } from "@/components/market/AddMarketModal";
import { MarketGroupType } from "@/types/enums";
import { MarketUpdateItem } from "@/types/market";
import { UIProvider } from "@/ui";

function renderModal(onSubmit: (market: MarketUpdateItem) => Promise<void>) {
  const onClose = vi.fn();
  render(
    <UIProvider>
      <AddMarketModal
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

describe("AddMarketModal", () => {
  it("빈 이름·시세 누락·이미 있는 이름을 알리고 제출하지 않는다", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    renderModal(onSubmit);
    expect(screen.getByLabelText("분류")).toHaveValue(MarketGroupType.ETC);

    submit();

    expect(
      await screen.findByText("정보를 다시 확인해주세요")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("이름")).toHaveAccessibleDescription(
      "이름을 입력해주세요"
    );
    expect(screen.getByLabelText("시세")).toHaveAccessibleDescription(
      "시세를 입력해주세요"
    );

    change("이름", " 원목 ");
    expect(screen.getByLabelText("이름")).toHaveAccessibleDescription(
      "이미 있는 시세 이름입니다"
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("공백을 지운 이름·시세·분류로 제출하고 닫는다", async () => {
    const onSubmit = vi.fn(() => Promise.resolve());
    const { onClose } = renderModal(onSubmit);

    change("이름", " 은 ");
    change("시세", "50");
    change("분류", MarketGroupType.MINERAL);
    submit();

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "은",
      price: 50,
      group: MarketGroupType.MINERAL,
    });
  });
});
