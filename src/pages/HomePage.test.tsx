import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { App } from "antd";
import { HomePage } from "@/pages/HomePage";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { CartProvider } from "@/state/cart";
import { createResult } from "@/test/fixtures";
import { ResultSearchParams } from "@/types/result";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchResults = vi.hoisted(() => vi.fn());
vi.mock("@/apis/result", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchResults: (params: unknown) => mockedFetchResults(params),
}));

// 현재 주소를 보여 주고, 뒤로 가기를 할 수 있게 하는 도우미
function LocationProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div data-testid='search'>{decodeURIComponent(location.search)}</div>
      <button onClick={() => navigate(-1)}>뒤로</button>
    </>
  );
}

function renderHome(initialPath: string) {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <App>
        <CartProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <HomePage />
            <LocationProbe />
          </MemoryRouter>
        </CartProvider>
      </App>
    </QueryClientProvider>
  );
}

const requestedPages = () =>
  mockedFetchResults.mock.calls.map(
    ([params]) => (params as ResultSearchParams).page
  );

beforeEach(() => {
  mockedFetchResults.mockImplementation(
    async ({ name }: ResultSearchParams) => ({
      content: [
        createResult({ id: 1, name: name ? `${name} 결과` : "전체 결과" }),
      ],
      totalElements: 15,
    })
  );
});

describe("HomePage", () => {
  it("주소의 검색 조건으로 조회하고 입력창에 채운다", async () => {
    renderHome("/?name=나무");

    expect(await screen.findByText("나무 결과")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("물품명 입력")).toHaveValue("나무");
    expect(mockedFetchResults).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 10, name: "나무" })
    );
  });

  it("검색하면 주소에 반영하고, 뒤로 가면 이전 조건과 입력창으로 돌아간다", async () => {
    renderHome("/?name=나무");
    await screen.findByText("나무 결과");

    const input = screen.getByPlaceholderText("물품명 입력");
    fireEvent.change(input, { target: { value: "탁자" } });
    fireEvent.click(screen.getByRole("button", { name: /검\s?색/ }));

    expect(await screen.findByText("탁자 결과")).toBeInTheDocument();
    expect(screen.getByTestId("search")).toHaveTextContent("?name=탁자");

    fireEvent.click(screen.getByText("뒤로"));

    expect(await screen.findByText("나무 결과")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByPlaceholderText("물품명 입력")).toHaveValue("나무")
    );
  });

  it("주소의 페이지가 결과 범위를 넘으면 마지막 페이지로 바로잡는다", async () => {
    renderHome("/?page=9");

    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent("?page=2")
    );
    // 15개(2쪽)이므로 9쪽(인덱스 8)을 확인한 뒤 2쪽(인덱스 1)을 조회한다
    await waitFor(() => expect(requestedPages()).toEqual([8, 1]));
  });
});
