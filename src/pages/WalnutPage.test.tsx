import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App } from "antd";
import { WalnutPage } from "pages/WalnutPage";
import { Link, MemoryRouter } from "react-router-dom";
import { CartProvider, useCart } from "state/cart";
import { createResult } from "test/fixtures";
import { WalnutResponse } from "types/experience";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedCalculate = jest.fn();
jest.mock("apis/experience", () => ({
  calculateWalnut: (params: unknown) => mockedCalculate(params),
}));

const response = (remindExperience: number): WalnutResponse => ({
  remindExperience,
  remindCount: 1,
  ample: { result: createResult({ id: 7, name: "앰플 재료" }) },
});

function CartCount() {
  const { entries } = useCart();
  return <div>담긴 개수: {entries.length}</div>;
}

function renderWalnut() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <App>
        <CartProvider>
          <MemoryRouter
            initialEntries={["/walnut?presentLevel=60&objectiveLevel=70"]}
          >
            <Link to='/walnut?presentLevel=60&objectiveLevel=80'>
              다음 조건
            </Link>
            <CartCount />
            <WalnutPage />
          </MemoryRouter>
        </CartProvider>
      </App>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
});

describe("WalnutPage", () => {
  it("새 조건을 계산하는 동안 이전 결과는 장바구니에 담을 수 없다", async () => {
    mockedCalculate
      .mockResolvedValueOnce(response(1000))
      .mockReturnValueOnce(new Promise(() => {}));
    renderWalnut();

    expect(await screen.findByText("남은 경험치: 1,000")).toBeInTheDocument();

    fireEvent.click(screen.getByText("다음 조건"));
    // 새 조건 계산이 시작된 뒤에도 이전 결과는 보이지만 담기지 않는다
    await waitFor(() => expect(mockedCalculate).toHaveBeenCalledTimes(2));
    expect(screen.getByText("남은 경험치: 1,000")).toBeInTheDocument();

    fireEvent.click(screen.getByText("앰플 재료"));
    expect(screen.getByText("담긴 개수: 0")).toBeInTheDocument();
  });

  it("계산이 끝난 결과는 앰플 재료를 눌러 장바구니에 담는다", async () => {
    mockedCalculate.mockResolvedValueOnce(response(1000));
    renderWalnut();

    fireEvent.click(await screen.findByText("앰플 재료"));

    expect(screen.getByText("담긴 개수: 1")).toBeInTheDocument();
  });
});
