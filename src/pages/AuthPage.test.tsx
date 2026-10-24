import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/lib/authSession";
import { AuthPage } from "@/pages/AuthPage";
import { createSession } from "@/test/fixtures";
import {
  InitialEntry,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const mockedLogin = vi.hoisted(() => vi.fn());
const mockedSignup = vi.hoisted(() => vi.fn());
vi.mock("@/apis/auth", () => ({
  login: (body: unknown) => mockedLogin(body),
  signup: (body: unknown) => mockedSignup(body),
}));

// 돌아간 화면이 받은 state를 보여 준다
function ResultProbe() {
  const { state } = useLocation();
  return <div data-testid='result-state'>{JSON.stringify(state)}</div>;
}

function renderAuth(entry: InitialEntry) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path='/login' element={<AuthPage mode='login' />} />
          <Route path='/signup' element={<AuthPage mode='signup' />} />
          <Route path='/manage' element={<div>관리 화면</div>} />
          <Route path='/free/result' element={<ResultProbe />} />
          <Route path='/' element={<div>홈 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

beforeEach(() => {
  clearAuthSession();
});

describe("AuthPage", () => {
  it("로그인하면 세션을 저장하고 로그인 전에 보던 화면으로 돌아간다", async () => {
    const session = createSession();
    mockedLogin.mockResolvedValue(session);
    renderAuth({ pathname: "/login", state: { from: "/manage" } });

    fill("아이디", "admin");
    fill("비밀번호", "pw");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));

    expect(await screen.findByText("관리 화면")).toBeInTheDocument();
    expect(mockedLogin).toHaveBeenCalledWith({
      username: "admin",
      password: "pw",
    });
    expect(getAuthSession()).toBe(session);
  });

  it("실패하면 서버 메시지를 필드 이름 없이 보여 주고, 다시 제출하면 지운다", async () => {
    mockedLogin
      .mockRejectedValueOnce(
        new MyHomeError({
          message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        })
      )
      .mockReturnValueOnce(new Promise(() => {}));
    renderAuth("/login");
    fill("아이디", "admin");
    fill("비밀번호", "wrong");

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(
      await screen.findByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(
      await screen.findByRole("button", { name: "로그인" })
    ).toHaveAttribute("aria-busy", "true");
    expect(
      screen.queryByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).not.toBeInTheDocument();
    expect(getAuthSession()).toBeNull();
  });

  it("돌아갈 화면의 state(헤더가 넘긴 fromState)도 함께 되돌린다", async () => {
    saveAuthSession(createSession());
    renderAuth({
      pathname: "/login",
      state: { from: "/free/result", fromState: { markets: [1] } },
    });

    expect(await screen.findByTestId("result-state")).toHaveTextContent(
      '{"markets":[1]}'
    );
  });

  it("로그인 ↔ 회원가입으로 넘어가면 입력과 지난 서버 오류를 지운다", async () => {
    mockedLogin.mockRejectedValueOnce(
      new MyHomeError({ message: "아이디 또는 비밀번호가 올바르지 않습니다." })
    );
    renderAuth("/login");
    fill("아이디", "admin");
    fill("비밀번호", "wrong");
    fireEvent.click(screen.getByRole("button", { name: "로그인" }));
    expect(
      await screen.findByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: "회원가입" }));
    fireEvent.click(await screen.findByRole("link", { name: "로그인" }));

    expect(
      await screen.findByRole("button", { name: "로그인" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("아이디")).toHaveValue("");
    // 닉네임은 회원가입에서만 받는다
    expect(screen.queryByLabelText("닉네임")).not.toBeInTheDocument();
    expect(
      screen.queryByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).not.toBeInTheDocument();
  });

  it("회원가입 화면으로 넘어가도 돌아갈 화면을 유지하고, 비밀번호 확인이 다르면 요청하지 않는다", async () => {
    mockedSignup
      .mockRejectedValueOnce(
        new MyHomeError({
          message:
            "username: 이미 사용 중인 아이디입니다., password: 비밀번호가 너무 짧습니다., nickname: 이 필드는 blank일 수 없습니다.",
        })
      )
      .mockResolvedValueOnce(createSession({}, { isAdmin: false }));
    renderAuth({ pathname: "/login", state: { from: "/manage" } });

    fireEvent.click(screen.getByRole("link", { name: "회원가입" }));
    fill("아이디", "member");
    fill("비밀번호", "password-1");
    fill("비밀번호 확인", "password-2");
    fill("닉네임", "  ");
    fireEvent.click(screen.getByRole("button", { name: "가입하기" }));

    expect(
      await screen.findByText("비밀번호가 일치하지 않습니다.")
    ).toBeInTheDocument();
    expect(screen.getByText("닉네임을 입력해주세요.")).toBeInTheDocument();
    expect(mockedSignup).not.toHaveBeenCalled();

    fill("비밀번호 확인", "password-1");
    fill("닉네임", "늘흰");
    fireEvent.click(screen.getByRole("button", { name: "가입하기" }));
    expect(
      await screen.findByText(
        "이미 사용 중인 아이디입니다., 비밀번호가 너무 짧습니다., 이 필드는 blank일 수 없습니다."
      )
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "가입하기" }));
    expect(await screen.findByText("관리 화면")).toBeInTheDocument();
    expect(mockedSignup).toHaveBeenLastCalledWith({
      username: "member",
      password: "password-1",
      nickname: "늘흰",
    });
  });

  it.each([
    ["돌아갈 화면이 없으면", undefined],
    ["앱 밖 주소는 따르지 않고", "//evil.example/path"],
  ])("이미 로그인돼 있으면 %s 홈으로 보낸다", async (_, from) => {
    saveAuthSession(createSession());
    renderAuth({ pathname: "/login", state: { from } });

    expect(await screen.findByText("홈 화면")).toBeInTheDocument();
  });
});
