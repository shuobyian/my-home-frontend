import { render, screen } from "@testing-library/react";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { createCatalogCheck, createProblem } from "@/test/fixtures";
import { ComponentProps } from "react";
import { MemoryRouter } from "react-router";

function renderBanner(props: ComponentProps<typeof CatalogStatusBanner>) {
  return render(
    <MemoryRouter>
      <CatalogStatusBanner {...props} />
    </MemoryRouter>
  );
}

describe("CatalogStatusBanner", () => {
  it("불러오는 중이거나 실패하면 그 상태를 알린다", () => {
    const { unmount } = renderBanner({ loading: true });
    expect(screen.getByText("점검 중…")).toBeInTheDocument();
    unmount();

    renderBanner({ error: true });
    expect(
      screen.getByText("데이터 점검 정보를 불러오지 못했습니다.")
    ).toBeInTheDocument();
  });

  it("모든 물품이 정상이면 반영되었다고 알리고 점검 화면 링크는 두지 않는다", () => {
    renderBanner({ check: createCatalogCheck() });

    expect(
      screen.getByText("모든 물품이 결과 리스트에 반영되어 있습니다.")
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("반영되지 않은 물품을 오류와 확인 필요로 나눠 세고 데이터 점검으로 안내한다", () => {
    renderBanner({
      check: createCatalogCheck({
        products: [
          { id: 1, name: "판자", status: "ok", resultId: 1 },
          { id: 2, name: "식탁", status: "error", resultId: null },
          { id: 3, name: "의자", status: "missing", resultId: null },
          { id: 4, name: "책상", status: "stale", resultId: 4 },
        ],
      }),
    });

    expect(
      screen.getByText("결과에 반영되지 않은 물품 3개 (오류 1 · 확인 필요 2)")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "데이터 점검" })).toHaveAttribute(
      "href",
      "/manage/check"
    );
  });

  it("물품은 모두 정상이어도 물품과 상관없는 경고가 있으면 함께 알린다", () => {
    renderBanner({
      check: createCatalogCheck({
        problems: [
          createProblem({
            code: "REQUIRED_PRODUCT_MISSING",
            severity: "warning",
            productId: null,
            productName: "식물앰플-중급 가속",
            material: null,
            hint: null,
            message:
              "호두작 계산에 쓰는 물품의 결과가 없습니다. (식물앰플-중급 가속)",
          }),
        ],
      }),
    });

    expect(
      screen.getByText("모든 물품이 결과 리스트에 반영되어 있습니다.")
    ).toBeInTheDocument();
    expect(screen.getByText("확인할 점 1건")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "데이터 점검" })
    ).toBeInTheDocument();
  });
});
