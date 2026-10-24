import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { FreePage } from "@/pages/FreePage";
import { MemoryRouter } from "react-router";
import { CartProvider } from "@/state/cart";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchMarkets = vi.hoisted(() => vi.fn());
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchMarkets: () => mockedFetchMarkets(),
}));

function renderFree() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <CartProvider>
          <MemoryRouter>
            <FreePage />
          </MemoryRouter>
        </CartProvider>
      </UIProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  mockedFetchMarkets.mockResolvedValue([]);
});

describe("FreePage", () => {
  it("시세 입력 안내와 함께 장바구니 버튼을 보여 주고, 누르면 서랍을 연다", async () => {
    renderFree();

    expect(
      screen.getByText(
        "자유 모드는 직접 재료의 시세를 입력할 수 있는 모드입니다."
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "장바구니" }));

    expect(
      await screen.findByRole("dialog", { name: "장바구니" })
    ).toBeInTheDocument();
  });
});
