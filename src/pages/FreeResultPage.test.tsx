import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { ROUTES } from "@/app/routes";
import { FreeResultPage } from "@/pages/FreeResultPage";
import { MemoryRouter, Route, Routes } from "react-router";
import { CartProvider } from "@/state/cart";
import { UIProvider } from "@/ui";

// 계산 API는 부르지 않아야 한다(시세가 올바를 때만 계산)
const mockedCalculate = vi.hoisted(() => vi.fn());
vi.mock("@/apis/result", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  calculateResults: (body: unknown) => mockedCalculate(body),
}));

function renderWithState(state: unknown) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <CartProvider>
          <MemoryRouter
            initialEntries={[{ pathname: ROUTES.FREE_RESULT, state }]}
          >
            <Routes>
              <Route path={ROUTES.FREE} element={<div>시세 입력 화면</div>} />
              <Route path={ROUTES.FREE_RESULT} element={<FreeResultPage />} />
            </Routes>
          </MemoryRouter>
        </CartProvider>
      </UIProvider>
    </QueryClientProvider>
  );
}

describe("FreeResultPage", () => {
  it.each([
    ["state 없이 직접 들어온 경우", null],
    ["시세 형식이 맞지 않는 경우", { markets: [{ name: "원목" }] }],
    ["시세가 배열이 아닌 경우", { markets: "원목" }],
  ])("%s 시세 입력 화면으로 돌려보낸다", async (_, state) => {
    renderWithState(state);

    expect(await screen.findByText("시세 입력 화면")).toBeInTheDocument();
    expect(mockedCalculate).not.toHaveBeenCalled();
  });

  it("올바른 시세면 그 시세로 계산한다", async () => {
    mockedCalculate.mockResolvedValue({ results: [] });
    renderWithState({ markets: [{ id: 1, name: "원목", price: 500 }] });

    expect(
      await screen.findByText("입력한 시세로 계산한 결과")
    ).toBeInTheDocument();
    expect(mockedCalculate).toHaveBeenCalledWith({
      markets: [{ id: 1, name: "원목", price: 500 }],
    });
  });

  it("담은 물품을 확인할 수 있게 장바구니 버튼을 둔다", async () => {
    mockedCalculate.mockResolvedValue({ results: [] });
    renderWithState({ markets: [{ id: 1, name: "원목", price: 500 }] });

    expect(
      await screen.findByRole("button", { name: "장바구니" })
    ).toBeInTheDocument();
  });
});
