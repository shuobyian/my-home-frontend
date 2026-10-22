import { act, fireEvent, render, screen } from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ComponentType, lazy, ReactNode, Suspense } from "react";
import {
  Link,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { silenceExpectedErrors } from "@/test/silenceErrors";

// 브라우저 뒤로 가기와 현재 경로
function HistoryProbe() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <>
      <button onClick={() => navigate(-1)}>뒤로</button>
      <div data-testid='path'>{pathname}</div>
    </>
  );
}

// AppLayout처럼 오류 경계 안에서 Suspense로 지연 로딩 화면을 감싼다
function Layout() {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<div>불러오는 중</div>}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  );
}

function renderRoutes(
  initialEntries: string[],
  routes: ReactNode,
  extra?: ReactNode
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, throwOnError: true } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter
        initialEntries={initialEntries}
        initialIndex={initialEntries.length - 1}
      >
        <HistoryProbe />
        {extra}
        <Routes>
          <Route element={<Layout />}>{routes}</Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  silenceExpectedErrors();
});

describe("RouteErrorBoundary 화면 이동", () => {
  it("홈의 오류 화면에서 '홈으로'를 여러 번 눌러도 히스토리에 쌓지 않는다", async () => {
    const fetcher = vi.fn(async () => {
      throw new MyHomeError({ message: "서버 오류" });
    });
    function HomePage() {
      useQuery({ queryKey: ["home"], queryFn: fetcher });
      return <div>홈 내용</div>;
    }
    renderRoutes(
      ["/prev", "/"],
      <>
        <Route path='/prev' element={<div>이전 화면</div>} />
        <Route path='/' element={<HomePage />} />
      </>
    );

    fireEvent.click(await screen.findByRole("button", { name: /홈으로/ }));
    fireEvent.click(await screen.findByRole("button", { name: /홈으로/ }));
    await screen.findByRole("button", { name: /홈으로/ });
    // 같은 주소로 이동할 때마다 다시 요청한다
    expect(fetcher).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByText("뒤로"));

    expect(await screen.findByText("이전 화면")).toBeInTheDocument();
    expect(screen.getByTestId("path")).toHaveTextContent("/prev");
  });

  it("지연 로딩 화면의 코드를 받는 중에 뒤로 가 이동이 버려져도, 이후 쿼리 오류를 오류 화면으로 보여 준다", async () => {
    // 앱 안에서 이동해 들어온 화면(PUSH)에서 시작한다. 히스토리의 첫 항목으로 돌아오는 경우는
    // 다시 렌더되지 않아 막지 못한다(RouteErrorBoundary 주석 참고).
    let failNext = false;
    const fetcher = vi.fn(async () => {
      if (failNext) throw new MyHomeError({ message: "나중 오류" });
      return "데이터";
    });
    function ListPage() {
      const { data, refetch } = useQuery({
        queryKey: ["list"],
        queryFn: fetcher,
      });
      return (
        <>
          <div>{data ? `결과: ${data}` : "로딩 중"}</div>
          <button onClick={() => refetch()}>다시 받기</button>
        </>
      );
    }
    // 코드를 끝내 받지 못하는 지연 로딩 화면
    const NeverPage = lazy(
      () => new Promise<{ default: ComponentType }>(() => {})
    );
    renderRoutes(
      ["/start"],
      <>
        <Route path='/start' element={<div>시작 화면</div>} />
        <Route path='/list' element={<ListPage />} />
        <Route path='/lazy' element={<NeverPage />} />
      </>,
      <>
        <Link to='/list'>목록</Link>
        <Link to='/lazy'>지연 화면</Link>
      </>
    );
    fireEvent.click(screen.getByText("목록"));
    expect(await screen.findByText("결과: 데이터")).toBeInTheDocument();

    // transition으로 처리되는 이동이 보류된 채 뒤로 가서, 보류된 렌더가 버려진다
    fireEvent.click(screen.getByText("지연 화면"));
    expect(screen.getByText("결과: 데이터")).toBeInTheDocument();
    fireEvent.click(screen.getByText("뒤로"));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    expect(screen.getByTestId("path")).toHaveTextContent("/list");

    failNext = true;
    fireEvent.click(screen.getByText("다시 받기"));

    expect(await screen.findByText("나중 오류")).toBeInTheDocument();
  });
});
