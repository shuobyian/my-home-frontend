import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { logout } from "@/apis/auth";
import { MyHomeError } from "@/apis/errors";
import { AppHeader } from "@/app/AppHeader";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/lib/authSession";
import { CartProvider } from "@/state/cart";
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

function renderHeader(path: InitialEntry = "/walnut") {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <CartProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppHeader />
          <Routes>
            <Route path='/login' element={<LoginProbe />} />
            <Route path='*' element={null} />
          </Routes>
        </MemoryRouter>
      </CartProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  clearAuthSession();
});

describe("AppHeader 로그인 상태", () => {
  it("로그인 전에는 로그인 버튼을 보여 주고, 누르면 지금 화면(주소와 state)을 돌아올 곳으로 넘긴다", async () => {
    renderHeader({
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
    renderHeader();

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
