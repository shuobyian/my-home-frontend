import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProductManagePage } from "@/pages/manage/ProductManagePage";
import { createProduct } from "@/test/fixtures";
import { ProductSearchParams } from "@/types/product";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchProducts = vi.hoisted(() => vi.fn());
vi.mock("@/apis/product", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchProducts: (params: unknown) => mockedFetchProducts(params),
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
        <ProductManagePage />
      </UIProvider>
    </QueryClientProvider>
  );
}

const requestedPages = () =>
  mockedFetchProducts.mock.calls.map(
    ([params]) => (params as ProductSearchParams).page
  );

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
