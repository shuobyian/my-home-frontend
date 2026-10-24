import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { ProductManagePage } from "@/pages/manage/ProductManagePage";
import {
  createCatalogCheck,
  createProblem,
  createProduct,
} from "@/test/fixtures";
import { CategoryType, ToolType } from "@/types/enums";
import { ProductSearchParams } from "@/types/product";
import { UIProvider } from "@/ui";
import { MemoryRouter } from "react-router";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchProducts = vi.hoisted(() => vi.fn());
const api = vi.hoisted(() => ({
  createProduct: vi.fn(),
  deleteProducts: vi.fn(),
  fetchCatalogCheck: vi.fn(),
  updateMarkets: vi.fn(),
}));
vi.mock("@/apis/product", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchProducts: (params: unknown) => mockedFetchProducts(params),
  createProduct: (body: unknown) => api.createProduct(body),
  deleteProducts: (body: unknown) => api.deleteProducts(body),
}));
vi.mock("@/apis/catalog", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchCatalogCheck: () => api.fetchCatalogCheck(),
}));
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  updateMarkets: (body: unknown) => api.updateMarkets(body),
}));

const productsOf = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) =>
    createProduct({ id: from + i, name: `물품 ${from + i}` })
  );

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        {/* 점검 배너의 링크 때문에 라우터가 필요하다 */}
        <MemoryRouter>
          <ProductManagePage />
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>
  );
}

const requestedPages = () =>
  mockedFetchProducts.mock.calls.map(
    ([params]) => (params as ProductSearchParams).page
  );

beforeEach(() => {
  api.fetchCatalogCheck.mockResolvedValue(createCatalogCheck());
  api.updateMarkets.mockResolvedValue([]);
  api.createProduct.mockImplementation(async (body: object) => ({
    id: 99,
    ...body,
  }));
});

describe("ProductManagePage", () => {
  it("보던 페이지가 범위를 넘으면(다른 곳에서 물품 삭제 등) 마지막 페이지로 한 번에 바로잡는다", async () => {
    // 처음에는 25개(3쪽)였다가, 3쪽을 열 때는 15개(2쪽)로 줄어 있다
    mockedFetchProducts.mockImplementation(
      async ({ page }: ProductSearchParams) => {
        if (page === 0)
          return { content: productsOf(1, 10), totalElements: 25 };
        if (page === 2) return { content: [], totalElements: 15 };
        return { content: productsOf(11, 5), totalElements: 15 };
      }
    );
    renderTable();
    expect(await screen.findByText("물품 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "3 페이지" }));

    expect(await screen.findByText("물품 11")).toBeInTheDocument();
    await waitFor(() => expect(requestedPages()).toEqual([0, 2, 1]));
    // 이전 목록(빈 3쪽)을 보여 주는 동안 한 번 더 넘어가 1쪽까지 가지 않는다
    expect(screen.queryByText("물품 1")).not.toBeInTheDocument();
  });

  it("쪽당 개수를 바꾸면 보던 쪽을 서버에 그대로 요청하고, 그 쪽이 사라지면 마지막 쪽을 요청한다", async () => {
    const TOTAL = 60;
    mockedFetchProducts.mockImplementation(
      async ({ page, size }: ProductSearchParams) => ({
        content: productsOf(
          page * size + 1,
          Math.min(size, TOTAL - page * size)
        ),
        totalElements: TOTAL,
      })
    );
    renderTable();
    expect(await screen.findByText("물품 1")).toBeInTheDocument();
    const requestedPageSizes = () =>
      mockedFetchProducts.mock.calls.map(([params]) => {
        const { page, size } = params as ProductSearchParams;
        return { page, size };
      });

    fireEvent.click(screen.getByRole("button", { name: "3 페이지" }));
    expect(await screen.findByText("물품 21")).toBeInTheDocument();

    // 3쪽(서버 page 2)을 20개씩으로 보면 41~60번째 물품이다
    const sizeSelect = screen.getByRole("combobox", { name: "페이지당 개수" });
    fireEvent.change(sizeSelect, { target: { value: "20" } });
    expect(await screen.findByText("물품 41")).toBeInTheDocument();

    // 50개씩이면 3쪽이 없으므로 마지막 쪽(서버 page 1)으로 맞춘다
    fireEvent.change(sizeSelect, { target: { value: "50" } });
    await waitFor(() =>
      expect(requestedPageSizes()).toEqual([
        { page: 0, size: 10 },
        { page: 2, size: 10 },
        { page: 2, size: 20 },
        { page: 1, size: 50 },
      ])
    );
    expect(
      await screen.findByRole("button", { name: "2 페이지", current: "page" })
    ).toBeInTheDocument();
  });
});

describe("ProductManagePage 결과 연결", () => {
  // 점검 정보(시세·물품 이름)가 도착했다는 표시
  const ALL_REFLECTED = "모든 물품이 결과 리스트에 반영되어 있습니다.";
  const change = (element: HTMLElement, value: string) =>
    fireEvent.change(element, { target: { value } });

  // 물품 추가 모달에 반지(재료: 시세에 없는 은)를 채운다
  async function fillNewProductWithNewMaterial() {
    fireEvent.click(screen.getByRole("button", { name: "추가" }));
    const dialog = await screen.findByRole("dialog", { name: "물품 추가" });
    const [name, materialName] = within(dialog).getAllByLabelText("물품명");
    change(name, "반지");
    change(within(dialog).getByRole("spinbutton", { name: "레벨" }), "3");
    change(
      within(dialog).getByRole("spinbutton", { name: "크래프팅 가격" }),
      "500"
    );
    change(
      within(dialog).getByRole("combobox", { name: "도구" }),
      ToolType.WOOD
    );
    change(
      within(dialog).getByRole("combobox", { name: "카테고리" }),
      CategoryType.NORMAL
    );
    change(materialName, "은");
    fireEvent.click(within(dialog).getByRole("radio", { name: "최하위재료" }));
    change(within(dialog).getByRole("spinbutton", { name: "개수" }), "2");
    change(within(dialog).getByLabelText("새 시세: 은"), "300");
    return dialog;
  }
  const ring = {
    name: "반지",
    level: 3,
    craftingPrice: 500,
    tool: ToolType.WOOD,
    category: CategoryType.NORMAL,
    materials: [{ name: "은", basic: true, count: 2 }],
  };

  it("결과 리스트 생성 버튼 없이, 물품마다 점검한 결과 상태를 보여 준다", async () => {
    mockedFetchProducts.mockResolvedValue({
      content: productsOf(1, 3),
      totalElements: 3,
    });
    api.fetchCatalogCheck.mockResolvedValue(
      createCatalogCheck({
        products: [
          { id: 1, name: "물품 1", status: "ok", resultId: 1 },
          { id: 2, name: "물품 2", status: "error", resultId: null },
        ],
        problems: [
          createProblem({
            productId: 2,
            productName: "물품 2",
            message: "시세 정보가 없는 재료가 있습니다. (물품 2: 원목)",
          }),
        ],
      })
    );
    renderTable();

    expect(await screen.findByText("정상")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "결과 리스트 생성" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "상태" })
    ).toBeInTheDocument();
    // 문제 문구는 마우스를 올리면 보인다
    expect(screen.getByText("계산 불가")).toHaveAttribute(
      "title",
      "시세 정보가 없는 재료가 있습니다. (물품 2: 원목)"
    );
    // 점검 정보에 아직 없는 물품(방금 추가 등)은 상태를 모른다
    const [, , unknownRow] = screen.getAllByRole("row").slice(1);
    expect(within(unknownRow).getByText("-")).toBeInTheDocument();
    expect(
      screen.getByText("결과에 반영되지 않은 물품 1개 (오류 1 · 확인 필요 0)")
    ).toBeInTheDocument();
  });

  it("시세에 없는 새 재료는 시세를 먼저 추가한 뒤 물품을 추가하고, 점검을 다시 받는다", async () => {
    mockedFetchProducts.mockResolvedValue({ content: [], totalElements: 0 });
    renderTable();
    await screen.findByText(ALL_REFLECTED);
    expect(api.fetchCatalogCheck).toHaveBeenCalledTimes(1);

    const dialog = await fillNewProductWithNewMaterial();
    fireEvent.click(within(dialog).getByRole("button", { name: "추가" }));

    expect(
      await screen.findByText(
        "새 시세 1개와 함께 추가했습니다. 결과 리스트에도 반영했습니다."
      )
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledWith([
      { name: "은", price: 300 },
    ]);
    expect(api.createProduct).toHaveBeenCalledWith(ring);
    expect(api.updateMarkets.mock.invocationCallOrder[0]).toBeLessThan(
      api.createProduct.mock.invocationCallOrder[0]
    );
    expect(
      screen.queryByRole("dialog", { name: "물품 추가" })
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(api.fetchCatalogCheck.mock.calls.length).toBeGreaterThan(1)
    );
  });

  it("물품 저장이 실패하면 알림창을 띄우고 모달을 유지하며, 다시 저장할 때 같은 시세를 또 추가하지 않는다", async () => {
    mockedFetchProducts.mockResolvedValue({ content: [], totalElements: 0 });
    api.createProduct.mockRejectedValueOnce(
      new MyHomeError({
        message: "합계 금액이 너무 커서 저장할 수 없습니다. (반지)",
      })
    );
    renderTable();
    await screen.findByText(ALL_REFLECTED);

    const dialog = await fillNewProductWithNewMaterial();
    fireEvent.click(within(dialog).getByRole("button", { name: "추가" }));

    const alert = await screen.findByRole("dialog", {
      name: "저장하지 못했습니다",
    });
    expect(alert).toHaveTextContent(
      "합계 금액이 너무 커서 저장할 수 없습니다. (반지)"
    );
    expect(
      screen.getByRole("dialog", { name: "물품 추가" })
    ).toBeInTheDocument();
    fireEvent.click(within(alert).getByRole("button", { name: "확인" }));

    fireEvent.click(within(dialog).getByRole("button", { name: "추가" }));
    await waitFor(() => expect(api.createProduct).toHaveBeenCalledTimes(2));
    expect(api.updateMarkets).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(
        "새 시세 1개와 함께 추가했습니다. 결과 리스트에도 반영했습니다."
      )
    ).toBeInTheDocument();
  });

  it("삭제가 실패하면 서버 메시지를 알림창으로 보여 주고 확인창을 유지한다", async () => {
    mockedFetchProducts.mockResolvedValue({
      content: productsOf(1, 1),
      totalElements: 1,
    });
    api.deleteProducts.mockRejectedValue(
      new MyHomeError({
        message:
          "다른 물품의 재료로 쓰이는 물품은 삭제할 수 없습니다. (식탁: 물품 1)",
      })
    );
    renderTable();

    fireEvent.click(
      await screen.findByRole("checkbox", { name: "물품 1 선택" })
    );
    fireEvent.click(screen.getByRole("button", { name: "삭제" }));
    const confirm = await screen.findByRole("dialog", {
      name: "1개 물품을 삭제하시겠습니까?",
    });
    fireEvent.click(within(confirm).getByRole("button", { name: "삭제" }));

    expect(
      await screen.findByRole("dialog", { name: "삭제하지 못했습니다" })
    ).toHaveTextContent(
      "다른 물품의 재료로 쓰이는 물품은 삭제할 수 없습니다. (식탁: 물품 1)"
    );
    expect(api.deleteProducts).toHaveBeenCalledWith({ ids: [1] });
    expect(confirm).toBeInTheDocument();
  });
});
