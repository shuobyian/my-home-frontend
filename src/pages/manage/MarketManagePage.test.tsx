import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { MarketManagePage } from "@/pages/manage/MarketManagePage";
import { createCatalogCheck } from "@/test/fixtures";
import { Market } from "@/types/market";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const api = vi.hoisted(() => ({
  fetchMarkets: vi.fn(),
  updateMarkets: vi.fn(),
  deleteMarkets: vi.fn(),
  fetchCatalogCheck: vi.fn(),
}));
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchMarkets: () => api.fetchMarkets(),
  updateMarkets: (body: unknown) => api.updateMarkets(body),
  deleteMarkets: (body: unknown) => api.deleteMarkets(body),
}));
vi.mock("@/apis/catalog", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchCatalogCheck: () => api.fetchCatalogCheck(),
}));

const wood: Market = { id: 1, name: "원목", price: 500 };
const gold: Market = { id: 3, name: "금", price: 1000 };

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <MarketManagePage />
      </UIProvider>
    </QueryClientProvider>
  );
}

const change = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const clickSave = () =>
  fireEvent.click(screen.getByRole("button", { name: "저장" }));

beforeEach(() => {
  api.fetchMarkets.mockResolvedValue([wood, gold]);
  api.updateMarkets.mockResolvedValue([]);
  api.deleteMarkets.mockResolvedValue({ deletedIds: [] });
  api.fetchCatalogCheck.mockResolvedValue(
    createCatalogCheck({
      markets: [
        { ...wood, usedBy: ["의자", "식탁"] },
        { ...gold, usedBy: [] },
      ],
    })
  );
});

describe("MarketManagePage", () => {
  it("새 행은 id 없이 저장하고, 저장 뒤 서버 값으로 다시 채운다", async () => {
    renderPage();
    expect(await screen.findByLabelText("원목 시세")).toHaveValue("500");

    fireEvent.click(screen.getByRole("button", { name: "재료 추가" }));
    change("새 재료 1 이름", "은");
    change("새 재료 1 시세", "50");
    api.fetchMarkets.mockResolvedValue([
      wood,
      gold,
      { id: 4, name: "은", price: 50 },
    ]);
    clickSave();

    expect(
      await screen.findByText("저장했습니다. 결과도 다시 계산했습니다.")
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledWith([{ name: "은", price: 50 }]);
    // 새로 받은 서버 시세로 다시 채워 새 행이 저장된 행(id 있음)이 된다
    expect(await screen.findByLabelText("은 시세")).toHaveValue("50");
    expect(screen.queryByLabelText("새 재료 1 이름")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeDisabled();
  });

  it("쓰는 물품이 있는 시세의 이름을 바꾸면 확인을 받고 저장한다", async () => {
    renderPage();
    await screen.findByText("2개");

    change("원목 이름", "참나무");
    clickSave();

    const dialog = await screen.findByRole("dialog", {
      name: "이름을 바꾸시겠습니까?",
    });
    expect(dialog).toHaveTextContent(
      "'원목' → '참나무': 이 재료를 쓰는 물품 2개(의자, 식탁)의 레시피도 함께 바뀝니다."
    );
    expect(api.updateMarkets).not.toHaveBeenCalled();

    fireEvent.click(within(dialog).getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(api.updateMarkets).toHaveBeenCalledWith([
        { id: 1, name: "참나무" },
      ])
    );
  });

  it("쓰는 물품이 없는 시세의 이름 변경은 확인 없이 저장한다", async () => {
    renderPage();
    await screen.findByText("2개");

    change("금 이름", "금괴");
    clickSave();

    await waitFor(() =>
      expect(api.updateMarkets).toHaveBeenCalledWith([{ id: 3, name: "금괴" }])
    );
    expect(
      screen.queryByRole("dialog", { name: "이름을 바꾸시겠습니까?" })
    ).not.toBeInTheDocument();
  });

  it("저장에 실패하면 서버 메시지를 알림창으로 보여 주고 입력을 유지한다", async () => {
    api.updateMarkets.mockRejectedValue(
      new MyHomeError({ message: "존재하지 않는 시세입니다. (id: 3)" })
    );
    renderPage();
    await screen.findByText("2개");

    change("금 시세", "2000");
    clickSave();

    const alert = await screen.findByRole("dialog", {
      name: "저장하지 못했습니다",
    });
    expect(alert).toHaveTextContent("존재하지 않는 시세입니다. (id: 3)");
    expect(screen.getByLabelText("금 시세")).toHaveValue("2000");
  });

  it("쓰는 물품이 없는 시세를 확인 뒤 삭제하고 표에서도 뺀다", async () => {
    renderPage();
    await screen.findByText("2개");
    expect(screen.getByRole("button", { name: "원목 삭제" })).toBeDisabled();

    api.fetchMarkets.mockResolvedValue([wood]);
    api.deleteMarkets.mockResolvedValue({ deletedIds: [3] });
    fireEvent.click(screen.getByRole("button", { name: "금 삭제" }));
    const dialog = await screen.findByRole("dialog", {
      name: "'금' 시세를 삭제하시겠습니까?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

    expect(await screen.findByText("삭제되었습니다.")).toBeInTheDocument();
    expect(api.deleteMarkets).toHaveBeenCalledWith({ ids: [3] });
    await waitFor(() =>
      expect(screen.queryByLabelText("금 시세")).not.toBeInTheDocument()
    );
  });
});
