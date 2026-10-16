import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { login } from "apis/auth";
import { MyHomeError } from "apis/errors";
import { RequireAdmin } from "app/RequireAdmin";
import { SESSION_KEY } from "lib/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "state/auth";

jest.mock("apis/auth", () => ({ login: jest.fn() }));
const mockedLogin = login as jest.MockedFunction<typeof login>;

function renderManage(initialPath = "/manage") {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route element={<RequireAdmin />}>
              <Route path='/manage' element={<div>관리 내용</div>} />
              <Route path='/manage/product' element={<div>물품 관리</div>} />
            </Route>
            <Route path='/' element={<div>홈 화면</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function submitPassword(password: string) {
  fireEvent.change(screen.getByPlaceholderText("비밀번호 입력"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /^확\s?인$/ }));
}

beforeEach(() => {
  sessionStorage.clear();
});

describe("RequireAdmin", () => {
  it("비밀번호를 확인하기 전에는 관리 화면을 그리지 않는다", () => {
    renderManage();

    expect(screen.getByText("관리자만 입장 가능합니다.")).toBeInTheDocument();
    expect(screen.queryByText("관리 내용")).not.toBeInTheDocument();
  });

  it("비밀번호가 맞으면 관리 화면을 보여 주고 이 탭에서 기억한다", async () => {
    mockedLogin.mockResolvedValue(undefined);
    renderManage();

    submitPassword("pw");

    expect(await screen.findByText("관리 내용")).toBeInTheDocument();
    expect(mockedLogin).toHaveBeenCalledWith("pw");
    expect(sessionStorage.getItem(SESSION_KEY.ADMIN)).toBe("true");
  });

  it("비밀번호가 틀리면 서버 메시지를 보여 주고 관리 화면은 그리지 않는다", async () => {
    // react-query가 mutation 에러를 console.error로 기록하므로 테스트 출력에서 숨긴다
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockedLogin.mockRejectedValue(
      new MyHomeError({ message: "비밀번호가 올바르지 않습니다." })
    );
    renderManage();

    submitPassword("wrong");

    expect(
      await screen.findByText("비밀번호가 올바르지 않습니다.")
    ).toBeInTheDocument();
    expect(screen.queryByText("관리 내용")).not.toBeInTheDocument();
  });

  it("이 탭에서 이미 확인했으면 바로 관리 화면을 보여 주고, '관리 종료'로 다시 잠근다", async () => {
    sessionStorage.setItem(SESSION_KEY.ADMIN, "true");
    renderManage();

    expect(screen.getByText("관리 내용")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "관리 종료" }));

    await waitFor(() =>
      expect(screen.queryByText("관리 내용")).not.toBeInTheDocument()
    );
    expect(sessionStorage.getItem(SESSION_KEY.ADMIN)).toBeNull();
  });

  it("관리 메뉴는 현재 화면을 표시하고(끝 슬래시 포함) 누르면 이동한다", async () => {
    sessionStorage.setItem(SESSION_KEY.ADMIN, "true");
    renderManage("/manage/");

    expect(screen.getByText("관리 내용")).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Raw 엑셀 데이터" })
    ).toBeChecked();

    fireEvent.click(screen.getByText("물품 리스트"));

    expect(await screen.findByText("물품 관리")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "물품 리스트" })).toBeChecked();
  });
});
