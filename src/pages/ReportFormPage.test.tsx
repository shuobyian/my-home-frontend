import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { ROUTES } from "@/app/routes";
import { clearAuthSession, saveAuthSession } from "@/lib/authSession";
import { ReportFormPage } from "@/pages/ReportFormPage";
import { createProduct, createSession } from "@/test/fixtures";
import { Report } from "@/types/report";
import { UIProvider } from "@/ui";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const api = vi.hoisted(() => ({
  createReport: vi.fn(),
  fetchReport: vi.fn(),
}));
vi.mock("@/apis/report", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  createReport: (body: unknown) => api.createReport(body),
  fetchReport: (id: number) => api.fetchReport(id),
}));
vi.mock("@/apis/experience", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchExperience: async () => [
    { id: 89, level: 89, amount: 9000000 },
    { id: 90, level: 90, amount: 9500000 },
  ],
}));
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchMarkets: async () => [{ id: 1, name: "원목", price: 500 }],
}));
vi.mock("@/apis/product", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchAllProducts: async () => [createProduct()],
}));

function LoginProbe() {
  const { state } = useLocation();
  return <div data-testid='login-from'>{state?.from}</div>;
}

function DetailProbe() {
  return <div data-testid='detail'>{useParams().id}</div>;
}

function renderPage(path: string) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <UIProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path={ROUTES.REPORT_NEW} element={<ReportFormPage />} />
            <Route path={ROUTES.REPORT_EDIT} element={<ReportFormPage />} />
            <Route path={ROUTES.REPORT_DETAIL} element={<DetailProbe />} />
            <Route path={ROUTES.LOGIN} element={<LoginProbe />} />
          </Routes>
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>
  );
}

const member = { id: 7, username: "member", nickname: "늘흰", isAdmin: false };
const report: Report = {
  id: 3,
  kind: "DATA",
  title: "90레벨 경험치",
  content: "",
  status: "OPEN",
  answer: "",
  author: { id: 7, nickname: "늘흰" },
  changes: [],
  createdAt: "2026-10-30T00:00:00Z",
  updatedAt: "2026-10-30T00:00:00Z",
};

beforeEach(() => {
  clearAuthSession();
  api.createReport.mockReset();
  api.fetchReport.mockReset();
});

describe("ReportFormPage", () => {
  it("로그인하지 않았으면 로그인 화면으로 보내고 돌아올 곳을 넘긴다", () => {
    renderPage(ROUTES.REPORT_NEW);

    expect(screen.getByTestId("login-from")).toHaveTextContent("/report/new");
  });

  it("90레벨 경험치를 10,000,000으로 바꾸자는 제보를 보낸다", async () => {
    saveAuthSession(createSession({}, member));
    api.createReport.mockResolvedValue(report);
    renderPage(ROUTES.REPORT_NEW);

    fireEvent.change(await screen.findByRole("textbox", { name: "제목" }), {
      target: { value: " 90레벨 경험치 " },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "대상" }), {
      target: { value: "90" },
    });
    expect(screen.getByText("현재 값: 9,500,000")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "바른 값" }), {
      target: { value: "10,000,000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "저장하기" }));

    expect(await screen.findByTestId("detail")).toHaveTextContent("3");
    expect(api.createReport).toHaveBeenCalledWith({
      kind: "DATA",
      title: "90레벨 경험치",
      content: "",
      changes: [
        {
          target: "EXPERIENCE",
          targetId: 90,
          field: "amount",
          value: 10000000,
        },
      ],
    });
  });

  it("빠진 값이 있으면 보내지 않고 안내한다", async () => {
    saveAuthSession(createSession({}, member));
    renderPage(ROUTES.REPORT_NEW);

    fireEvent.click(await screen.findByRole("button", { name: "저장하기" }));

    expect(screen.getByText("제목을 입력해주세요.")).toBeInTheDocument();
    expect(screen.getByText("바꿀 대상을 골라주세요.")).toBeInTheDocument();
    expect(api.createReport).not.toHaveBeenCalled();
  });

  it("남이 쓴 제보는 고칠 수 없다", async () => {
    saveAuthSession(createSession({}, { ...member, id: 8 }));
    api.fetchReport.mockResolvedValue(report);
    renderPage("/report/3/edit");

    expect(
      await screen.findByText("고칠 수 없는 제보입니다")
    ).toBeInTheDocument();
  });
});
