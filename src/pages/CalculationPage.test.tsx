import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { clearAuthSession, saveAuthSession } from "@/lib/authSession";
import { STORAGE_KEY } from "@/lib/storage";
import { CalculationPage } from "@/pages/CalculationPage";
import { CartProvider } from "@/state/cart";
import { createResult, createSession } from "@/test/fixtures";
import { UIProvider } from "@/ui";
import { MemoryRouter } from "react-router";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchInventory = vi.hoisted(() => vi.fn());
vi.mock("@/apis/inventory", () => ({
  fetchInventory: () => mockedFetchInventory(),
}));

// 나무 의자(원목 30개) 2개와 나무 탁자(원목 20개, 못 5개) 1개를 담은 장바구니
function fillCart() {
  const chair = createResult({
    id: 1,
    name: "나무 의자",
    materials: [{ name: "원목", count: 30, price: 15000 }],
  });
  const table = createResult({
    id: 2,
    name: "나무 탁자",
    materials: [
      { name: "원목", count: 20, price: 10000 },
      { name: "못", count: 5, price: 50 },
    ],
  });
  localStorage.setItem(
    STORAGE_KEY.CART,
    JSON.stringify({
      "server:1": { key: "server:1", source: "server", item: chair, count: 2 },
      "server:2": { key: "server:2", source: "server", item: table, count: 1 },
    })
  );
}

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <CartProvider>
          <MemoryRouter>
            <CalculationPage />
          </MemoryRouter>
        </CartProvider>
      </UIProvider>
    </QueryClientProvider>
  );
}

// 첫 칸이 재료 이름인 행의 칸 글자
const cellsOf = (name: string) =>
  screen
    .getAllByRole("row")
    .map((row) =>
      within(row)
        .queryAllByRole("cell")
        .map((cell) => cell.textContent)
    )
    .find((cells) => cells[0] === name);

beforeEach(() => {
  fillCart();
});

afterEach(() => {
  clearAuthSession();
  localStorage.clear();
});

describe("CalculationPage", () => {
  it("로그인하면 합산한 기초 재료에서 보유 개수를 뺀 부족 개수를 함께 보여 준다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    mockedFetchInventory.mockResolvedValue([
      { marketId: 1, name: "원목", count: 45 },
      { marketId: 2, name: "못", count: 99 },
    ]);
    renderPage();

    // 원목 30×2 + 20 = 80개 중 45개 보유
    await waitFor(() =>
      expect(cellsOf("원목")).toEqual([
        "원목",
        "80개",
        "45개",
        "35개",
        "-",
        "40,000골드",
      ])
    );
    expect(cellsOf("못")).toEqual(["못", "5개", "99개", "0개", "-", "50골드"]);
  });

  it("로그인하지 않았으면 기초 재료 합산만 보여 준다", () => {
    renderPage();

    expect(cellsOf("원목")).toEqual(["원목", "80개", "-", "40,000골드"]);
    expect(mockedFetchInventory).not.toHaveBeenCalled();
  });
});
