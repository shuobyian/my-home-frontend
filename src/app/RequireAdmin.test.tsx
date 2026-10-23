import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { login } from "@/apis/auth";
import { MyHomeError } from "@/apis/errors";
import { preloadManagePages } from "@/app/managePages";
import { RequireAdmin } from "@/app/RequireAdmin";
import { SESSION_KEY } from "@/lib/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthProvider } from "@/state/auth";

vi.mock("@/apis/auth", () => ({ login: vi.fn() }));
const mockedLogin = vi.mocked(login);
// 관리 화면 코드를 실제로 받지 않고 미리 받기 요청 여부만 본다
vi.mock("@/app/managePages", () => ({ preloadManagePages: vi.fn() }));
const mockedPreload = vi.mocked(preloadManagePages);

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
  fireEvent.click(screen.getByRole("button", { name: "확인" }));
}

beforeEach(() => {
  sessionStorage.clear();
});

describe("RequireAdmin", () => {
  it("비밀번호를 확인하기 전에는 관리 화면을 그리지 않는다", () => {
    renderManage();

    expect(screen.getByText("관리자만 입장 가능합니다.")).toBeInTheDocument();
    // 라벨은 화면에서 숨겨도 접근 이름과 필수 표시는 남는다
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute(
      "aria-required",
      "true"
    );
    expect(screen.queryByText("관리 내용")).not.toBeInTheDocument();
    // 관리 화면 코드도 받지 않는다
    expect(mockedPreload).not.toHaveBeenCalled();
  });

  it("비밀번호가 맞으면 관리 화면을 보여 주고 이 탭에서 기억한다", async () => {
    mockedLogin.mockResolvedValue(undefined);
    renderManage();

    submitPassword("pw");

    expect(await screen.findByText("관리 내용")).toBeInTheDocument();
    expect(mockedLogin).toHaveBeenCalledWith("pw");
    expect(sessionStorage.getItem(SESSION_KEY.ADMIN)).toBe("true");
    // 확인 뒤에는 메뉴 이동이 바로 반응하도록 관리 화면 코드를 미리 받는다
    expect(mockedPreload).toHaveBeenCalledTimes(1);
  });

  it("비밀번호가 틀리면 서버 메시지를 보여 주고 관리 화면은 그리지 않는다", async () => {
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

  it("다시 제출하면 확인하는 동안 이전 실패 메시지를 지우고 버튼을 로딩 상태로 둔다", async () => {
    mockedLogin
      .mockRejectedValueOnce(
        new MyHomeError({ message: "비밀번호가 올바르지 않습니다." })
      )
      .mockReturnValueOnce(new Promise(() => {}));
    renderManage();

    submitPassword("wrong");
    expect(
      await screen.findByText("비밀번호가 올바르지 않습니다.")
    ).toBeInTheDocument();

    submitPassword("pw");

    await waitFor(() =>
      expect(
        screen.queryByText("비밀번호가 올바르지 않습니다.")
      ).not.toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: "확인" })).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("실패 → 성공 → '관리 종료' 뒤 다시 보이는 확인 화면에는 이전 실패 메시지가 없다", async () => {
    mockedLogin
      .mockRejectedValueOnce(
        new MyHomeError({ message: "비밀번호가 올바르지 않습니다." })
      )
      .mockResolvedValueOnce(undefined);
    renderManage();

    submitPassword("wrong");
    await screen.findByText("비밀번호가 올바르지 않습니다.");
    submitPassword("pw");
    expect(await screen.findByText("관리 내용")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "관리 종료" }));

    expect(
      await screen.findByText("관리자만 입장 가능합니다.")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("비밀번호가 올바르지 않습니다.")
    ).not.toBeInTheDocument();
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
