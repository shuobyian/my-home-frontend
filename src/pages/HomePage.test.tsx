import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { clearAuthSession, saveAuthSession } from "@/lib/authSession";
import { HomePage } from "@/pages/HomePage";
import { MemoryRouter, useLocation, useNavigate } from "react-router";
import { CartProvider } from "@/state/cart";
import { createResult, createSession } from "@/test/fixtures";
import { ResultSearchParams } from "@/types/result";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedFetchResults = vi.hoisted(() => vi.fn());
vi.mock("@/apis/result", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchResults: (params: unknown) => mockedFetchResults(params),
}));

const mockedFetchInventory = vi.hoisted(() => vi.fn());
vi.mock("@/apis/inventory", () => ({
  fetchInventory: () => mockedFetchInventory(),
}));

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

// entries의 마지막 항목에서 시작한다(앞 항목은 뒤로 가기로 돌아갈 곳)
function renderHome(entries: string | string[]) {
  const initialEntries = Array.isArray(entries) ? entries : [entries];
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <CartProvider>
          <MemoryRouter
            initialEntries={initialEntries}
            initialIndex={initialEntries.length - 1}
          >
            <HomePage />
            <LocationProbe />
          </MemoryRouter>
        </CartProvider>
      </UIProvider>
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

afterEach(() => {
  clearAuthSession();
});

describe("HomePage", () => {
  it("로그인하면 펼친 결과의 기초 재료에 보유 개수와 부족 개수를 함께 보여 준다", async () => {
    saveAuthSession(createSession({}, { isAdmin: false }));
    mockedFetchInventory.mockResolvedValue([
      { marketId: 1, name: "원목", count: 100 },
    ]);
    mockedFetchResults.mockResolvedValue({
      content: [
        createResult({
          name: "나무 의자",
          materials: [{ name: "원목", count: 150, price: 75000 }],
        }),
      ],
      totalElements: 1,
    });
    renderHome("/");

    fireEvent.click(await screen.findByRole("button", { name: "행 펼치기" }));

    await waitFor(() =>
      expect(cellsOf("원목")).toEqual([
        "원목",
        "(50개 부족) 150개",
        "100개",
        "1.51뭉",
        "(25,000골드 부족) 75,000골드",
      ])
    );
  });

  it("로그인하지 않았으면 보유 재료를 받지 않고 기초 재료만 보여 준다", async () => {
    renderHome("/");

    fireEvent.click(await screen.findByRole("button", { name: "행 펼치기" }));

    expect(
      screen.getByRole("columnheader", { name: "골드" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/부족/)).not.toBeInTheDocument();
    expect(mockedFetchInventory).not.toHaveBeenCalled();
  });

  it("주소의 검색 조건으로 조회하고 입력창에 채운다", async () => {
    renderHome("/?name=나무");

    expect(await screen.findByText("나무 결과")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("물품명 입력")).toHaveValue("나무");
    expect(mockedFetchResults).toHaveBeenCalledWith(
      expect.objectContaining({ page: 0, size: 10, name: "나무" })
    );
  });

  it("장바구니 버튼으로 담은 물품을 확인한다(메뉴가 아니라 화면에 둔다)", async () => {
    renderHome("/");
    fireEvent.click(await screen.findByText("전체 결과"));

    // 담으면 버튼에 수량이 보이고, 누르면 담긴 물품이 서랍에 나온다
    fireEvent.click(screen.getByRole("button", { name: "장바구니 1개" }));

    const dialog = await screen.findByRole("dialog", { name: "장바구니" });
    expect(dialog).toHaveTextContent("전체 결과");
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

  it("주소의 페이지가 결과 범위를 넘으면 마지막 페이지로 바로잡는다(히스토리에 쌓지 않음)", async () => {
    renderHome(["/?name=이전", "/?page=9"]);

    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent("?page=2")
    );
    // 15개(2쪽)이므로 9쪽(인덱스 8)을 확인한 뒤 2쪽(인덱스 1)을 조회한다
    await waitFor(() => expect(requestedPages()).toEqual([8, 1]));

    // 보정은 replace라서 뒤로 가면 잘못된 주소(?page=9)가 아니라 그 전 화면으로 간다
    fireEvent.click(screen.getByText("뒤로"));
    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent("?name=이전")
    );
  });

  it("같은 조건으로 다시 검색하면 히스토리에 쌓지 않는다", async () => {
    renderHome("/?name=나무");
    await screen.findByText("나무 결과");

    const input = screen.getByPlaceholderText("물품명 입력");
    fireEvent.change(input, { target: { value: "탁자" } });
    fireEvent.click(screen.getByRole("button", { name: /검\s?색/ }));
    expect(await screen.findByText("탁자 결과")).toBeInTheDocument();

    // 제출은 동기라 바로 같은 주소로 바꾼다(replace)
    fireEvent.click(screen.getByRole("button", { name: /검\s?색/ }));

    fireEvent.click(screen.getByText("뒤로"));
    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent("?name=나무")
    );
  });
});
