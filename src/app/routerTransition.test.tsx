import { act, fireEvent, render, screen } from "@testing-library/react";
import { ComponentType, lazy, Suspense } from "react";
import { Link, MemoryRouter, Outlet, Route, Routes } from "react-router";

function LazyContent() {
  return <div>지연 화면</div>;
}

// 코드를 받는 데 시간이 걸리는 지연 로딩 화면을 흉내 낸다. finishLoading으로 받기를 끝낸다.
function createLazyPage() {
  let finish: (module: { default: ComponentType }) => void = () => {};
  const LazyPage = lazy(
    () =>
      new Promise<{ default: ComponentType }>((resolve) => {
        finish = resolve;
      })
  );
  return { LazyPage, finishLoading: () => finish({ default: LazyContent }) };
}

// AppLayout처럼 Outlet을 Suspense로 감싼 레이아웃 아래에서 지연 로딩 화면으로 이동한다
function renderRoutes(LazyPage: ComponentType, useTransitions?: boolean) {
  return render(
    <MemoryRouter initialEntries={["/"]} useTransitions={useTransitions}>
      <Link to='/lazy'>지연 화면으로</Link>
      <Routes>
        <Route
          element={
            <Suspense fallback={<div>불러오는 중</div>}>
              <Outlet />
            </Suspense>
          }
        >
          <Route path='/' element={<div>이전 화면</div>} />
          <Route path='/lazy' element={<LazyPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("라우터 화면 이동과 지연 로딩", () => {
  it("기본 설정에서는 지연 로딩 화면의 코드를 받는 동안 이전 화면을 유지한다", async () => {
    const { LazyPage, finishLoading } = createLazyPage();
    renderRoutes(LazyPage);

    fireEvent.click(screen.getByText("지연 화면으로"));

    // 이동이 transition으로 처리되어 Suspense 대체 화면으로 바뀌지 않는다
    expect(screen.getByText("이전 화면")).toBeInTheDocument();
    expect(screen.queryByText("불러오는 중")).not.toBeInTheDocument();

    await act(async () => finishLoading());

    expect(screen.getByText("지연 화면")).toBeInTheDocument();
    expect(screen.queryByText("이전 화면")).not.toBeInTheDocument();
  });

  it("useTransitions={false}로 끄면 코드를 받는 동안 대체 화면을 보여 준다", async () => {
    const { LazyPage, finishLoading } = createLazyPage();
    renderRoutes(LazyPage, false);

    fireEvent.click(screen.getByText("지연 화면으로"));

    expect(screen.getByText("불러오는 중")).toBeInTheDocument();

    await act(async () => finishLoading());

    expect(screen.getByText("지연 화면")).toBeInTheDocument();
  });
});
