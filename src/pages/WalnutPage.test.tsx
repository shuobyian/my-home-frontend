import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App } from "antd";
import { WalnutPage } from "@/pages/WalnutPage";
import { Link, MemoryRouter, useLocation, useNavigate } from "react-router";
import { CartProvider, useCart } from "@/state/cart";
import { createResult } from "@/test/fixtures";
import { WalnutResponse } from "@/types/experience";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다.
// vi.mock은 파일 맨 위로 끌어올려지므로 모의 함수도 vi.hoisted로 함께 올린다.
const mockedCalculate = vi.hoisted(() => vi.fn());
vi.mock("@/apis/experience", () => ({
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

// 현재 주소와 뒤로 가기
function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div data-testid='search'>{location.search}</div>
      <button onClick={() => navigate(-1)}>뒤로</button>
    </>
  );
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
            <LocationProbe />
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

  it("새 조건으로 계산하면 히스토리에 쌓아, 뒤로 가면 이전 조건으로 돌아간다", async () => {
    mockedCalculate.mockResolvedValue(response(1000));
    renderWalnut();
    await screen.findByText("남은 경험치: 1,000");

    fireEvent.change(screen.getByLabelText("목표 레벨"), {
      target: { value: "80" },
    });
    fireEvent.click(screen.getByRole("button", { name: /계산하기/ }));
    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent(
        "objectiveLevel=80"
      )
    );

    fireEvent.click(screen.getByText("뒤로"));
    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent(
        "objectiveLevel=70"
      )
    );
  });

  it("같은 조건으로 다시 누르면 다시 계산한다(실패 후 재시도 포함)", async () => {
    mockedCalculate.mockResolvedValue(response(1000));
    renderWalnut();
    await screen.findByText("남은 경험치: 1,000");
    expect(mockedCalculate).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /계산하기/ }));

    await waitFor(() => expect(mockedCalculate).toHaveBeenCalledTimes(2));
  });
});
