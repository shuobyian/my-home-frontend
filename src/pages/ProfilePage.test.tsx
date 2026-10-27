import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from "@/lib/authSession";
import { ProfilePage } from "@/pages/ProfilePage";
import { createSession } from "@/test/fixtures";
import { UIProvider } from "@/ui";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const api = vi.hoisted(() => ({ updateProfile: vi.fn() }));
vi.mock("@/apis/auth", () => ({
  updateProfile: (body: unknown) => api.updateProfile(body),
}));

// 로그인 화면 대신 돌아올 주소를 보여 준다
function LoginProbe() {
  const { state } = useLocation();
  return <div data-testid='login-from'>{state?.from}</div>;
}

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <UIProvider>
        <MemoryRouter initialEntries={[ROUTES.PROFILE]}>
          <Routes>
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.LOGIN} element={<LoginProbe />} />
          </Routes>
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>
  );
}

const member = { id: 7, username: "member", nickname: "늘흰", isAdmin: false };
const nicknameInput = () => screen.getByLabelText(/닉네임/);
const saveButton = () => screen.getByRole("button", { name: "저장하기" });

beforeEach(() => {
  clearAuthSession();
  api.updateProfile.mockReset();
});

describe("ProfilePage", () => {
  it("로그인하지 않았으면 로그인 화면으로 보내고 돌아올 곳을 넘긴다", () => {
    renderPage();

    expect(screen.getByTestId("login-from")).toHaveTextContent("/profile");
  });

  it("닉네임을 바꾸면 서버에 보내고, 저장한 세션의 회원 정보도 바꾼다", async () => {
    saveAuthSession(createSession({ token: "token-7" }, member));
    api.updateProfile.mockResolvedValue({ ...member, nickname: "새 닉네임" });
    renderPage();

    expect(screen.getByText("아이디 member")).toBeInTheDocument();
    // 바꾸기 전에는 저장할 것이 없다
    expect(saveButton()).toBeDisabled();
    fireEvent.change(nicknameInput(), { target: { value: " 새 닉네임 " } });
    fireEvent.click(saveButton());

    expect(
      await screen.findByText("프로필을 저장했습니다.")
    ).toBeInTheDocument();
    expect(api.updateProfile).toHaveBeenCalledWith({ nickname: " 새 닉네임 " });
    expect(getAuthSession()).toMatchObject({
      token: "token-7",
      user: { id: 7, nickname: "새 닉네임" },
    });
    // 서버가 다듬은 값으로 채워 다시 저장할 것이 없다
    expect(nicknameInput()).toHaveValue("새 닉네임");
    expect(saveButton()).toBeDisabled();
  });

  it("빈 닉네임은 보내지 않고, 서버가 거절하면 필드 이름을 뺀 메시지를 보여 준다", async () => {
    saveAuthSession(createSession({}, member));
    api.updateProfile.mockRejectedValue(
      new MyHomeError({ message: "nickname: 20자 이하로 입력해주세요." })
    );
    renderPage();

    fireEvent.change(nicknameInput(), { target: { value: "  " } });
    fireEvent.click(saveButton());
    expect(screen.getByText("닉네임을 입력해주세요.")).toBeInTheDocument();
    expect(api.updateProfile).not.toHaveBeenCalled();

    fireEvent.change(nicknameInput(), { target: { value: "다른 닉네임" } });
    fireEvent.click(saveButton());

    expect(
      await screen.findByText("20자 이하로 입력해주세요.")
    ).toBeInTheDocument();
    expect(getAuthSession()?.user.nickname).toBe("늘흰");
  });
});
