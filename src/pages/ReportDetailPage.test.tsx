import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { clearAuthSession, saveAuthSession } from "@/lib/authSession";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
import { createSession } from "@/test/fixtures";
import { Report } from "@/types/report";
import { UIProvider } from "@/ui";
import { MemoryRouter, Route, Routes } from "react-router";

const api = vi.hoisted(() => ({ fetchReport: vi.fn() }));
vi.mock("@/apis/report", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchReport: (id: number) => api.fetchReport(id),
}));

function renderPage() {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <UIProvider>
        <MemoryRouter initialEntries={["/report/3"]}>
          <Routes>
            <Route path={ROUTES.REPORT_DETAIL} element={<ReportDetailPage />} />
            <Route path={ROUTES.LOGIN} element={<p>로그인 화면</p>} />
          </Routes>
        </MemoryRouter>
      </UIProvider>
    </QueryClientProvider>
  );
}

const report: Report = {
  id: 3,
  kind: "DATA",
  title: "90레벨 경험치",
  content: "공식 표와 다릅니다.",
  status: "OPEN",
  answer: "",
  author: { id: 7, nickname: "늘흰" },
  changes: [
    {
      target: "EXPERIENCE",
      targetId: 90,
      label: "90레벨",
      field: "amount",
      before: 9500000,
      after: 10000000,
    },
  ],
  createdAt: "2026-10-30T00:00:00Z",
  updatedAt: "2026-10-30T00:00:00Z",
};
const member = { id: 7, username: "member", nickname: "늘흰", isAdmin: false };
const button = (name: string) => screen.queryByRole("button", { name });

beforeEach(() => {
  clearAuthSession();
  api.fetchReport.mockReset();
});

describe("ReportDetailPage", () => {
  it("로그인하지 않았으면 로그인으로 보낸다", async () => {
    api.fetchReport.mockResolvedValue(report);
    renderPage();

    expect(await screen.findByText("로그인 화면")).toBeInTheDocument();
    expect(api.fetchReport).not.toHaveBeenCalled();
  });

  it("바꿀 값을 쓸 때 값과 바른 값으로 보여 준다", async () => {
    saveAuthSession(createSession({}, member));
    api.fetchReport.mockResolvedValue(report);
    renderPage();

    expect(await screen.findByText("90레벨 경험치")).toBeInTheDocument();
    expect(screen.getByText("9,500,000")).toBeInTheDocument();
    expect(screen.getByText("10,000,000")).toBeInTheDocument();
  });

  it("쓴 사람은 접수 상태일 때만 고치고 지운다", async () => {
    saveAuthSession(createSession({}, member));
    api.fetchReport.mockResolvedValue(report);
    const { unmount } = renderPage();

    expect(await screen.findByRole("button", { name: "수정" })).toBeVisible();
    expect(button("삭제")).toBeVisible();
    expect(button("처리 저장")).not.toBeInTheDocument();
    unmount();

    api.fetchReport.mockResolvedValue({ ...report, status: "RESOLVED" });
    renderPage();
    expect(await screen.findByText("90레벨 경험치")).toBeInTheDocument();
    expect(button("수정")).not.toBeInTheDocument();
    expect(button("삭제")).not.toBeInTheDocument();
  });

  it("관리자는 남의 제보를 처리하거나 지운다", async () => {
    saveAuthSession(createSession());
    api.fetchReport.mockResolvedValue(report);
    renderPage();

    expect(
      await screen.findByRole("button", { name: "처리 저장" })
    ).toBeVisible();
    expect(button("삭제")).toBeVisible();
    expect(button("수정")).not.toBeInTheDocument();
  });

  it("없는 제보(남의 제보도 같다)는 안내한다", async () => {
    saveAuthSession(createSession({}, member));
    api.fetchReport.mockRejectedValue(
      new MyHomeError({ message: "존재하지 않는 제보입니다.", status: 404 })
    );
    renderPage();

    expect(
      await screen.findByText("존재하지 않는 제보입니다")
    ).toBeInTheDocument();
  });
});
