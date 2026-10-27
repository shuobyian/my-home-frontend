import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
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
import { ToolType } from "@/types/enums";
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
  it("로그인하면 카드에 부족 재료비를, 상세의 기초 재료에 보유 개수와 부족 개수를 보여 준다", async () => {
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

    const card = within(
      await screen.findByRole("list", { name: "결과 목록" })
    ).getByRole("listitem");
    await waitFor(() =>
      expect(card).toHaveTextContent("부족 재료비25,000골드")
    );

    fireEvent.click(
      within(card).getByRole("button", { name: "나무 의자 상세" })
    );

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

    fireEvent.click(
      await screen.findByRole("button", { name: "전체 결과 상세" })
    );

    expect(
      within(screen.getByRole("dialog", { name: "전체 결과" })).getByRole(
        "columnheader",
        { name: "골드" }
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/부족/)).not.toBeInTheDocument();
    expect(mockedFetchInventory).not.toHaveBeenCalled();
  });

  it("주소의 검색 조건으로 조회하고 입력창에 채운다", async () => {
    renderHome("/?name=나무");

    expect(await screen.findByText("나무 결과")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("물품명 입력")).toHaveValue("나무");
    expect(mockedFetchResults).toHaveBeenCalledWith(
      // page·size 없이 보내 전체를 받는다
      { name: "나무" }
    );
  });

  it("담기로 담은 물품을 장바구니 버튼으로 확인한다(메뉴가 아니라 화면에 둔다)", async () => {
    renderHome("/");
    // 카드 자체를 누르면 담기지 않는다
    fireEvent.click(await screen.findByText("전체 결과"));
    expect(
      screen.getByRole("button", { name: "장바구니" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전체 결과 담기" }));

    // 담으면 버튼에 수량이 보이고, 누르면 담긴 물품이 서랍에 나온다
    fireEvent.click(screen.getByRole("button", { name: "장바구니 1개" }));

    const dialog = await screen.findByRole("dialog", { name: "장바구니" });
    expect(dialog).toHaveTextContent("전체 결과");
  });

  it("검색 버튼 없이 입력을 멈추면 주소에 반영하고, 뒤로 가면 이전 조건과 입력창으로 돌아간다", async () => {
    renderHome("/?name=나무");
    await screen.findByText("나무 결과");
    expect(screen.queryByRole("button", { name: /검\s?색/ })).toBeNull();

    const input = screen.getByPlaceholderText("물품명 입력");
    fireEvent.change(input, { target: { value: "탁자" } });

    expect(await screen.findByText("탁자 결과")).toBeInTheDocument();
    expect(screen.getByTestId("search")).toHaveTextContent("?name=탁자");

    fireEvent.click(screen.getByText("뒤로"));

    expect(await screen.findByText("나무 결과")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByPlaceholderText("물품명 입력")).toHaveValue("나무")
    );
  });

  it("도구를 고르면 바로 검색한다", async () => {
    renderHome("/?name=나무");
    await screen.findByText("나무 결과");

    fireEvent.change(screen.getByLabelText("도구"), {
      target: { value: ToolType.WOOD },
    });

    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent(
        `?name=나무&tool=${ToolType.WOOD}`
      )
    );
  });

  it("주소는 공백을 지워도 입력한 공백은 남기고, 공백만 다른 이름은 히스토리에 쌓지 않는다", async () => {
    renderHome("/?name=나무");
    await screen.findByText("나무 결과");

    const input = screen.getByPlaceholderText("물품명 입력");
    fireEvent.change(input, { target: { value: "탁자 " } });
    expect(await screen.findByText("탁자 결과")).toBeInTheDocument();
    expect(input).toHaveValue("탁자 ");

    // 입력을 멈추면 공백을 지운 같은 주소로 바꾼다(replace)
    fireEvent.change(input, { target: { value: "탁자" } });
    await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
    expect(input).toHaveValue("탁자");

    fireEvent.click(screen.getByText("뒤로"));
    await waitFor(() =>
      expect(screen.getByTestId("search")).toHaveTextContent("?name=나무")
    );
  });
});
