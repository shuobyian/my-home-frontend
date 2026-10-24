import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { logout } from "@/apis/auth";
import { MyHomeError } from "@/apis/errors";
import { AppNav } from "@/app/AppNav";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/lib/authSession";
import { createSession } from "@/test/fixtures";
import {
  InitialEntry,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router";

vi.mock("@/apis/auth", () => ({ logout: vi.fn() }));
const mockedLogout = vi.mocked(logout);

// 로그인 화면 대신, 로그인 뒤 돌아올 주소와 그 화면의 state를 보여 준다
function LoginProbe() {
  const { state } = useLocation();
  return (
    <>
      <div data-testid='login-from'>{state?.from}</div>
      <div data-testid='login-from-state'>
        {JSON.stringify(state?.fromState)}
      </div>
    </>
  );
}

function renderNav(path: InitialEntry = "/walnut") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <AppNav />
        <Routes>
          <Route path='/login' element={<LoginProbe />} />
          <Route path='*' element={null} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const ADMIN_LABELS = ["Raw 엑셀 데이터", "물품 리스트", "시세 리스트"];

beforeEach(() => {
  clearAuthSession();
});

describe("AppNav 메뉴 구분", () => {
  it("로그인하지 않았으면 누구나 쓰는 메뉴만 보여 주고 관리자 메뉴는 감춘다(장바구니는 메뉴에 두지 않는다)", () => {
    renderNav();

    const nav = screen.getByRole("navigation", { name: "주 메뉴" });
    for (const name of ["홈", "호두작", "자유 모드"]) {
      expect(within(nav).getByRole("link", { name })).toBeInTheDocument();
    }
    expect(
      within(nav).queryByRole("button", { name: /장바구니/ })
    ).not.toBeInTheDocument();
    for (const name of ADMIN_LABELS) {
      expect(within(nav).queryByRole("link", { name })).not.toBeInTheDocument();
    }
  });

  it("관리자가 아닌 회원에게도 관리자 메뉴를 감춘다", () => {
    saveAuthSession(createSession({}, { username: "member", isAdmin: false }));
    renderNav();

    for (const name of ADMIN_LABELS) {
      expect(screen.queryByRole("link", { name })).not.toBeInTheDocument();
    }
    expect(screen.queryByText("관리자")).not.toBeInTheDocument();
  });

  it("관리자에게는 관리자 메뉴를 구분해 보여 준다", () => {
    saveAuthSession(createSession());
    renderNav();

    expect(screen.getByText("관리자")).toBeInTheDocument();
    for (const name of ADMIN_LABELS) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("관리자의 로그인이 풀리면 관리자 메뉴가 사라진다", async () => {
    saveAuthSession(createSession());
    renderNav();
    expect(
      screen.getByRole("link", { name: "물품 리스트" })
    ).toBeInTheDocument();

    clearAuthSession();

    expect(
      await screen.findByRole("button", { name: "로그인" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "물품 리스트" })
    ).not.toBeInTheDocument();
  });
});

describe("AppNav 현재 화면 표시", () => {
  it("현재 메뉴만 표시하고, 하위 화면(자유 모드 결과)에서도 그 메뉴를 표시한다", () => {
    renderNav("/free/result");

    expect(screen.getByRole("link", { name: "자유 모드" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    // 홈은 끝까지 맞을 때만 표시한다
    expect(screen.getByRole("link", { name: "홈" })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("link", { name: "호두작" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("관리 메뉴는 끝 슬래시가 있어도 정확히 그 화면만 표시한다", () => {
    saveAuthSession(createSession());
    const { unmount } = renderNav("/manage/");

    expect(
      screen.getByRole("link", { name: "Raw 엑셀 데이터" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "물품 리스트" })
    ).not.toHaveAttribute("aria-current");
    unmount();

    renderNav("/manage/product");

    // /manage/product에서는 상위 /manage 메뉴를 표시하지 않는다
    expect(
      screen.getByRole("link", { name: "Raw 엑셀 데이터" })
    ).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "물품 리스트" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("링크는 각 화면 주소로 이어진다", () => {
    saveAuthSession(createSession());
    renderNav();

    expect(screen.getByRole("link", { name: "홈" })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: "호두작" })).toHaveAttribute(
      "href",
      "/walnut"
    );
    expect(screen.getByRole("link", { name: "시세 리스트" })).toHaveAttribute(
      "href",
      "/manage/market"
    );
  });
});

describe("AppNav 로그인 상태", () => {
  it("로그인 전에는 로그인 버튼을 보여 주고, 누르면 지금 화면(주소와 state)을 돌아올 곳으로 넘긴다", async () => {
    renderNav({
      pathname: "/free/result",
      search: "?level=3",
      state: { markets: [1] },
    });

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByTestId("login-from")).toHaveTextContent(
      "/free/result?level=3"
    );
    expect(screen.getByTestId("login-from-state")).toHaveTextContent(
      '{"markets":[1]}'
    );
    // 로그인 화면에서는 버튼을 감춘다
    expect(
      screen.queryByRole("button", { name: "로그인" })
    ).not.toBeInTheDocument();
  });

  it("로그인하면 아이디와 로그아웃 버튼을 보여 주고, 서버 요청이 실패해도 이 기기에서는 로그아웃한다", async () => {
    mockedLogout.mockRejectedValue(new MyHomeError({ message: "연결 실패" }));
    saveAuthSession(createSession({}, { username: "member" }));
    renderNav();

    expect(screen.getByText("member")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));

    expect(
      await screen.findByRole("button", { name: "로그인" })
    ).toBeInTheDocument();
    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(getAuthSession()).toBeNull();
    expect(screen.queryByText("member")).not.toBeInTheDocument();
  });
});
