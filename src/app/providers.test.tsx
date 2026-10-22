import { act, fireEvent, render, screen } from "@testing-library/react";
import { AppProviders } from "@/app/providers";
import { ComponentType, lazy, Suspense } from "react";
import { Link, Outlet, Route, Routes } from "react-router";

function LazyContent() {
  return <div>지연 화면</div>;
}

describe("AppProviders 라우터 설정", () => {
  it("화면 이동을 transition으로 처리해 지연 로딩 중에도 이전 화면을 유지한다", async () => {
    let finish: (module: { default: ComponentType }) => void = () => {};
    const LazyPage = lazy(
      () =>
        new Promise<{ default: ComponentType }>((resolve) => {
          finish = resolve;
        })
    );
    window.history.replaceState(null, "", "/");

    render(
      <AppProviders>
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
      </AppProviders>
    );

    fireEvent.click(screen.getByText("지연 화면으로"));
    expect(screen.getByText("이전 화면")).toBeInTheDocument();
    expect(screen.queryByText("불러오는 중")).not.toBeInTheDocument();

    await act(async () => finish({ default: LazyContent }));
    expect(screen.getByText("지연 화면")).toBeInTheDocument();
  });
});
