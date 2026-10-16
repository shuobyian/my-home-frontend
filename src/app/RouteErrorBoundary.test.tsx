import { fireEvent, render, screen } from "@testing-library/react";
import { MyHomeError } from "apis/errors";
import { RouteErrorBoundary } from "app/RouteErrorBoundary";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router-dom";

// 실패 횟수만큼 실패한 뒤 성공하는 쿼리 함수
function createFlakyFetcher(failures: number) {
  let calls = 0;
  const fetcher = jest.fn(async () => {
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

function renderApp(fetcher: () => Promise<string>, initialPath = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: 0, useErrorBoundary: true } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Link to='/other'>다른 화면</Link>
        <Link to='/'>처음 화면</Link>
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
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  // ErrorBoundary가 잡은 에러를 React가 console.error로 출력하므로 테스트 출력에서 숨긴다
  jest.spyOn(console, "error").mockImplementation(() => {});
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
});
