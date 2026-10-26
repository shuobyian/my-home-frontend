import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { clearAuthSession, saveAuthSession } from "@/lib/authSession";
import { InventoryPage } from "@/pages/InventoryPage";
import { createSession } from "@/test/fixtures";
import { UIProvider } from "@/ui";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const api = vi.hoisted(() => ({
  fetchMarkets: vi.fn(),
  fetchInventory: vi.fn(),
  updateInventory: vi.fn(),
}));
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchMarkets: () => api.fetchMarkets(),
}));
vi.mock("@/apis/inventory", () => ({
  fetchInventory: () => api.fetchInventory(),
  updateInventory: (body: unknown) => api.updateInventory(body),
}));

// 로그인 화면 대신 돌아올 주소를 보여 준다
function LoginProbe() {
  const { state } = useLocation();
  return <div data-testid='login-from'>{state?.from}</div>;
}

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <MemoryRouter initialEntries={[ROUTES.INVENTORY]}>
          <Routes>
            <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginProbe />} />
          </Routes>
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>
  );
}

const input = (name: string) => screen.getByLabelText(`${name} 보유 개수`);
const change = (name: string, value: string) =>
  fireEvent.change(input(name), { target: { value } });
const saveButton = () => screen.getByRole("button", { name: "저장하기" });

beforeEach(() => {
  clearAuthSession();
  api.fetchMarkets.mockResolvedValue([
    { id: 1, name: "원목", price: 500 },
    { id: 2, name: "못", price: 10 },
    { id: 3, name: "천", price: 70 },
  ]);
  api.fetchInventory.mockResolvedValue([
    { marketId: 1, name: "원목", count: 3 },
  ]);
});

describe("InventoryPage", () => {
  it("로그인하지 않았으면 로그인 화면으로 보내고, 로그인하면 이 화면으로 돌아오게 한다", async () => {
    renderPage();

    expect(await screen.findByTestId("login-from")).toHaveTextContent(
      ROUTES.INVENTORY
    );
    expect(api.fetchInventory).not.toHaveBeenCalled();
  });

  it("저장된 보유 개수를 채우고, 저장된 값과 달라진 재료만 저장한다", async () => {
    saveAuthSession(createSession({}, { id: 7, isAdmin: false }));
    api.updateInventory.mockResolvedValue([
      { marketId: 1, name: "원목", count: 3 },
      { marketId: 2, name: "못", count: 120 },
    ]);
    renderPage();

    expect(await screen.findByLabelText("원목 보유 개수")).toHaveValue("3");
    expect(input("못")).toHaveValue("");
    expect(saveButton()).toBeDisabled();

    change("못", "120");
    change("천", "4");
    change("천", "0");
    fireEvent.click(saveButton());

    expect(await screen.findByText("보유 재료를 저장했습니다.")).toBeVisible();
    expect(api.updateInventory).toHaveBeenCalledWith([
      { marketId: 2, count: 120 },
    ]);
    // 저장된 값과 같아졌으므로 다시 바꾸기 전까지 저장하지 않는다
    await waitFor(() => expect(saveButton()).toBeDisabled());
  });

  it("비운 칸은 0개로 저장하고, 검색으로 표를 좁혀도 입력한 값은 남는다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    api.updateInventory.mockResolvedValue([]);
    renderPage();
    await screen.findByLabelText("원목 보유 개수");

    change("원목", "");
    fireEvent.change(screen.getByPlaceholderText("재료명 입력"), {
      target: { value: "못" },
    });
    fireEvent.click(screen.getByRole("button", { name: /검\s?색/ }));
    expect(screen.queryByLabelText("원목 보유 개수")).not.toBeInTheDocument();
    change("못", "9");

    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(api.updateInventory).toHaveBeenCalledWith([
        { marketId: 1, count: 0 },
        { marketId: 2, count: 9 },
      ])
    );
  });

  it("일괄 입력은 붙여 넣은 재료명·개수로 입력칸을 채우고, 저장은 저장하기로 한다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    api.updateInventory.mockResolvedValue([]);
    renderPage();
    await screen.findByLabelText("원목 보유 개수");

    fireEvent.click(screen.getByRole("button", { name: "일괄 입력" }));
    fireEvent.change(screen.getByLabelText("재료명과 보유 개수"), {
      target: { value: "못\t120\n천 4개\n철 3" },
    });
    expect(screen.getByText(/읽지 못한 줄 1개/)).toHaveTextContent("철 3");
    fireEvent.click(screen.getByRole("button", { name: "2개 입력" }));

    expect(input("못")).toHaveValue("120");
    expect(input("천")).toHaveValue("4");
    expect(api.updateInventory).not.toHaveBeenCalled();

    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(api.updateInventory).toHaveBeenCalledWith([
        { marketId: 2, count: 120 },
        { marketId: 3, count: 4 },
      ])
    );
  });

  it("−/+는 1뭉(99개)씩 바꾸고 0 밑으로는 내려가지 않는다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    api.updateInventory.mockResolvedValue([]);
    renderPage();
    await screen.findByLabelText("원목 보유 개수");
    const button = (label: string) =>
      screen.getByRole("button", { name: label });

    // 비어 있으면 0개라 뺄 수 없다
    expect(button("못 1뭉 빼기")).toBeDisabled();
    fireEvent.click(button("못 1뭉 더하기"));
    fireEvent.click(button("못 1뭉 더하기"));
    expect(input("못")).toHaveValue("198");

    fireEvent.click(button("원목 1뭉 더하기"));
    expect(input("원목")).toHaveValue("102");
    fireEvent.click(button("원목 1뭉 빼기"));
    fireEvent.click(button("원목 1뭉 빼기"));
    expect(input("원목")).toHaveValue("0");
    expect(button("원목 1뭉 빼기")).toBeDisabled();

    fireEvent.click(saveButton());

    await waitFor(() =>
      expect(api.updateInventory).toHaveBeenCalledWith([
        { marketId: 1, count: 0 },
        { marketId: 2, count: 198 },
      ])
    );
  });

  it("재료 카드를 얻는 곳별로 묶어 보여 준다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    api.fetchMarkets.mockResolvedValue([
      { id: 1, name: "원목", price: 500 },
      { id: 44, name: "철", price: 7000 },
      { id: 1001, name: "밀", price: 1010 },
    ]);
    renderPage();
    await screen.findByLabelText("밀 보유 개수");

    const groups = screen.getAllByRole("region");
    expect(groups.map((group) => group.getAttribute("aria-label"))).toEqual([
      "작물",
      "광물",
      "기타",
    ]);
    expect(groups[1]).toContainElement(input("철"));
  });

  it("저장하지 못하면 서버 메시지를 보여 주고 입력한 값은 그대로 둔다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    api.updateInventory.mockRejectedValue(
      new MyHomeError({ message: "존재하지 않는 시세입니다. (id: 2)" })
    );
    renderPage();
    await screen.findByLabelText("원목 보유 개수");

    change("못", "5");
    fireEvent.click(saveButton());

    expect(
      await screen.findByText("존재하지 않는 시세입니다. (id: 2)")
    ).toBeVisible();
    expect(input("못")).toHaveValue("5");
    expect(saveButton()).toBeEnabled();
  });
});
