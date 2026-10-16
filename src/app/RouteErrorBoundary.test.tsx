import { fireEvent, render, screen } from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import {
  Link,
  MemoryRouter,
  Outlet,
  Route,
  Routes,
  useSearchParams,
} from "react-router-dom";
import { silenceExpectedErrors } from "@/test/silenceErrors";
import { ROUTER_FUTURE } from "@/app/routes";

// 실패 횟수만큼 실패한 뒤 성공하는 쿼리 함수
function createFlakyFetcher(failures: number) {
  let calls = 0;
  const fetcher = vi.fn(async () => {
    calls += 1;
    if (calls <= failures) {
      throw new MyHomeError({ message: `서버 오류 ${calls}` });
    }
    return "데이터";
  });
  return fetcher;
}

function QueryPage({ fetcher }: { fetcher: () => Promise<string> }) {
  const { data } = useQuery({ queryKey: ["page"], queryFn: fetcher });
  return <div>{data ? `결과: ${data}` : "로딩 중"}</div>;
}

// 렌더 중에 바로 에러를 던지는 화면
function BrokenPage(): never {
  throw new MyHomeError({ message: "렌더 실패" });
}

function renderApp(fetcher: () => Promise<string>, initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, throwOnError: true } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={ROUTER_FUTURE} initialEntries={[initialPath]}>
        <Link to='/other'>다른 화면</Link>
        <Link to='/'>처음 화면</Link>
        <Link to='/broken'>고장 난 화면</Link>
        <Routes>
          <Route
            element={
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            }
          >
            <Route path='/' element={<QueryPage fetcher={fetcher} />} />
            <Route path='/other' element={<div>다른 화면 내용</div>} />
            <Route path='/broken' element={<BrokenPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// 주소의 ?q=로 검색하는 화면. 주소가 바뀌어도 같은 컴포넌트가 계속 마운트되어 있다.
function SearchPage({ fetcher }: { fetcher: (q: string) => Promise<string> }) {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const { data } = useQuery({
    queryKey: ["search", q],
    queryFn: () => fetcher(q),
    // 실제 검색 화면처럼 조건이 바뀌는 동안 이전 결과를 유지한다
    placeholderData: keepPreviousData,
  });
  return <div>{data ? `검색: ${data}` : "로딩 중"}</div>;
}

function renderSearch(fetcher: (q: string) => Promise<string>) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, throwOnError: true } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter future={ROUTER_FUTURE} initialEntries={["/search?q=a"]}>
        <Link to='/search?q=b'>다음 검색</Link>
        <Routes>
          <Route
            element={
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            }
          >
            <Route path='/search' element={<SearchPage fetcher={fetcher} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  silenceExpectedErrors();
});

describe("RouteErrorBoundary", () => {
  it("쿼리가 실패하면 서버 메시지와 함께 오류 화면을 보여 준다", async () => {
    renderApp(createFlakyFetcher(1));

    expect(
      await screen.findByText("화면을 불러오지 못했습니다.")
    ).toBeInTheDocument();
    expect(screen.getByText("서버 오류 1")).toBeInTheDocument();
  });

  it("'다시 시도'를 누르면 실패한 쿼리를 다시 요청한다", async () => {
    const fetcher = createFlakyFetcher(1);
    renderApp(fetcher);
    await screen.findByText("화면을 불러오지 못했습니다.");

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByText("결과: 데이터")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("홈('/')에서 실패해도 '홈으로'를 누르면 다시 요청한다", async () => {
    const fetcher = createFlakyFetcher(1);
    renderApp(fetcher, "/");
    await screen.findByText("화면을 불러오지 못했습니다.");

    fireEvent.click(screen.getByRole("button", { name: "홈으로" }));

    expect(await screen.findByText("결과: 데이터")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("다른 화면으로 이동하면 초기화되고, 실패했던 화면으로 돌아오면 다시 요청한다", async () => {
    const fetcher = createFlakyFetcher(1);
    renderApp(fetcher);
    await screen.findByText("화면을 불러오지 못했습니다.");

    fireEvent.click(screen.getByText("다른 화면"));
    expect(await screen.findByText("다른 화면 내용")).toBeInTheDocument();

    fireEvent.click(screen.getByText("처음 화면"));
    expect(await screen.findByText("결과: 데이터")).toBeInTheDocument();
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("이동한 화면이 렌더 중에 바로 에러를 던져도 오류 화면을 보여 준다", async () => {
    renderApp(createFlakyFetcher(0));
    expect(await screen.findByText("결과: 데이터")).toBeInTheDocument();

    fireEvent.click(screen.getByText("고장 난 화면"));

    expect(await screen.findByText("렌더 실패")).toBeInTheDocument();

    // 오류 화면에서 다른 화면으로 이동하면 다시 정상 화면을 보여 준다
    fireEvent.click(screen.getByText("처음 화면"));
    expect(await screen.findByText("결과: 데이터")).toBeInTheDocument();
  });

  it("같은 화면에서 주소(검색 조건)만 바뀐 뒤 실패해도 오류 화면을 보여 준다", async () => {
    const fetcher = vi.fn(async (q: string) => {
      if (q === "b") throw new MyHomeError({ message: "검색 실패" });
      return q;
    });
    renderSearch(fetcher);

    expect(await screen.findByText("검색: a")).toBeInTheDocument();
    fireEvent.click(screen.getByText("다음 검색"));

    expect(await screen.findByText("검색 실패")).toBeInTheDocument();
  });

  it("지연 로딩 코드를 받지 못하면 새로고침을 안내한다", async () => {
    const chunkError = new TypeError(
      "Failed to fetch dynamically imported module: http://x/assets/a.js"
    );
    renderApp(async () => {
      throw chunkError;
    });

    expect(await screen.findByText("새로고침")).toBeInTheDocument();
    expect(screen.queryByText("다시 시도")).not.toBeInTheDocument();
  });
});
