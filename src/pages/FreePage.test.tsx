import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ROUTES } from "@/app/routes";
import { FreePage } from "@/pages/FreePage";
import { readJSON, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { MemoryRouter, Route, Routes } from "react-router";
import { Market } from "@/types/market";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchMarkets = vi.hoisted(() => vi.fn());
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchMarkets: () => mockedFetchMarkets(),
}));

const wood: Market = { id: 1, name: "원목", price: 500 };
const egg: Market = { id: 84, name: "이스터 에그", price: 0 };

function renderFree() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <MemoryRouter initialEntries={[ROUTES.FREE]}>
          <Routes>
            <Route path={ROUTES.FREE} element={<FreePage />} />
            <Route path={ROUTES.FREE_RESULT} element={<div>결과 화면</div>} />
          </Routes>
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("FreePage", () => {
  it("저장본에 없는 서버 재료를 표에 덧붙이고, 저장해 둔 입력값은 지킨다", async () => {
    writeJSON(STORAGE_KEY.MARKET, [{ ...wood, price: 700 }]);
    mockedFetchMarkets.mockResolvedValue([wood, egg]);
    renderFree();

    expect(await screen.findByLabelText("이스터 에그 시세")).toHaveValue("0");
    expect(screen.getByLabelText("원목 시세")).toHaveValue("700");
    expect(
      screen.getByText("새 재료 1개를 시세에 추가했습니다.")
    ).toBeInTheDocument();

    // 덧붙은 재료도 결과를 만들 때 저장본에 포함된다
    fireEvent.click(screen.getByRole("button", { name: "결과 만들기" }));
    expect(await screen.findByText("결과 화면")).toBeInTheDocument();
    expect(readJSON(STORAGE_KEY.MARKET)).toEqual([
      { ...wood, price: 700 },
      egg,
    ]);
  });

  it("덧붙일 재료가 없으면 저장본 그대로 두고 알리지 않는다", async () => {
    writeJSON(STORAGE_KEY.MARKET, [{ ...wood, price: 700 }]);
    mockedFetchMarkets.mockResolvedValue([wood]);
    renderFree();

    // 서버 시세가 도착하면 '시세 불러오기'가 켜진다
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "시세 불러오기" })
      ).toBeEnabled()
    );
    expect(screen.getByLabelText("원목 시세")).toHaveValue("700");
    expect(screen.queryByText(/새 재료/)).not.toBeInTheDocument();
  });

  it("저장본이 없으면 서버 시세로 채운다", async () => {
    mockedFetchMarkets.mockResolvedValue([wood, egg]);
    renderFree();

    expect(await screen.findByLabelText("원목 시세")).toHaveValue("500");
    expect(screen.getByLabelText("이스터 에그 시세")).toHaveValue("0");
    expect(screen.queryByText(/새 재료/)).not.toBeInTheDocument();
  });
});
