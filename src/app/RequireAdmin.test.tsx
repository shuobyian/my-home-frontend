import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { login } from "@/apis/auth";
import { preloadManagePages } from "@/app/managePages";
import { RequireAdmin } from "@/app/RequireAdmin";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/lib/authSession";
import { createSession } from "@/test/fixtures";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

// 관리 화면 코드를 실제로 받지 않고 미리 받기 요청 여부만 본다
vi.mock("@/app/managePages", () => ({ preloadManagePages: vi.fn() }));
const mockedPreload = vi.mocked(preloadManagePages);
vi.mock("@/apis/auth", () => ({ login: vi.fn() }));
const mockedLogin = vi.mocked(login);

// 로그인 화면 대신, 로그인 뒤 돌아올 주소(state.from)를 보여 준다
function LoginProbe() {
  const { state } = useLocation();
  return <div data-testid='login-from'>{state?.from}</div>;
}

function renderManage(initialPath = "/manage") {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<RequireAdmin />}>
            <Route path='/manage' element={<div>관리 내용</div>} />
            <Route path='/manage/product' element={<div>물품 관리</div>} />
            {/* 저장하지 않은 입력이 남는지 보려는 화면 */}
            <Route
              path='/manage/market'
              element={<input aria-label='시세' />}
            />
          </Route>
          <Route path='/login' element={<LoginProbe />} />
          <Route path='/' element={<div>홈 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  clearAuthSession();
});

describe("RequireAdmin", () => {
  it("로그인하지 않았으면 관리 화면 대신 로그인 화면으로 보내고, 돌아올 주소를 넘긴다", async () => {
    renderManage("/manage/product?page=2");

    expect(await screen.findByTestId("login-from")).toHaveTextContent(
      "/manage/product?page=2"
    );
    expect(screen.queryByText("물품 관리")).not.toBeInTheDocument();
    // 관리 화면 코드도 받지 않는다
    expect(mockedPreload).not.toHaveBeenCalled();
  });

  it("관리자가 아닌 회원에게는 안내만 보여 준다", async () => {
    saveAuthSession(createSession({}, { username: "member", isAdmin: false }));
    renderManage();

    expect(screen.getByText("관리자만 입장 가능합니다.")).toBeInTheDocument();
    expect(screen.queryByText("관리 내용")).not.toBeInTheDocument();
    expect(mockedPreload).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "홈으로" }));
    expect(await screen.findByText("홈 화면")).toBeInTheDocument();
  });

  it("관리자면 관리 화면을 보여 주고 관리 화면 코드를 미리 받는다", () => {
    saveAuthSession(createSession());
    renderManage();

    expect(screen.getByText("관리 내용")).toBeInTheDocument();
    // 메뉴 이동이 바로 반응하도록 관리 화면 코드를 미리 받는다
    expect(mockedPreload).toHaveBeenCalledTimes(1);
  });

  it("보는 중에 로그인이 풀리면(만료·토큰 거절·다른 탭) 화면과 입력을 그대로 두고 그 위에서 다시 로그인하게 한다", async () => {
    const renewed = createSession({ token: "token-2" });
    mockedLogin
      .mockResolvedValueOnce(
        createSession({}, { username: "member", isAdmin: false })
      )
      .mockResolvedValueOnce(renewed);
    saveAuthSession(createSession());
    renderManage("/manage/market");
    fireEvent.change(screen.getByLabelText("시세"), {
      target: { value: "저장 전 입력" },
    });

    act(() => clearAuthSession());

    const dialog = await screen.findByRole("dialog", {
      name: "다시 로그인해주세요",
    });
    expect(screen.getByLabelText("시세")).toHaveValue("저장 전 입력");
    const submit = (username: string) => {
      fireEvent.change(within(dialog).getByLabelText("아이디"), {
        target: { value: username },
      });
      fireEvent.change(within(dialog).getByLabelText("비밀번호"), {
        target: { value: "pw" },
      });
      fireEvent.click(within(dialog).getByRole("button", { name: "로그인" }));
    };

    // 관리자가 아닌 계정으로 로그인하면 창을 그대로 두고 입력도 지킨다
    submit("member");
    expect(
      await within(dialog).findByText(/member 계정은 관리자가 아닙니다/)
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(screen.getByLabelText("시세")).toHaveValue("저장 전 입력");

    submit("admin");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
    expect(getAuthSession()).toBe(renewed);
    expect(screen.getByLabelText("시세")).toHaveValue("저장 전 입력");
  });

  it("다시 로그인 창을 닫으면 관리 화면에서 나간다", async () => {
    saveAuthSession(createSession());
    renderManage();
    act(() => clearAuthSession());

    fireEvent.click(
      within(
        await screen.findByRole("dialog", { name: "다시 로그인해주세요" })
      ).getByRole("button", { name: "닫기" })
    );

    expect(await screen.findByText("홈 화면")).toBeInTheDocument();
    expect(screen.queryByText("관리 내용")).not.toBeInTheDocument();
  });
});
