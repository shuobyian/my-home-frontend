import { render, screen, within } from "@testing-library/react";
import { ProblemTable } from "@/components/catalog/ProblemTable";
import { createProblem } from "@/test/fixtures";
import { CatalogProblem } from "@/types/catalog";

const missingPrice = createProblem();
const staleResult = createProblem({
  code: "STALE_RESULT",
  severity: "warning",
  productId: 2,
  productName: "식탁",
  material: null,
  hint: "'결과 다시 맞추기'를 누르세요.",
  message: "저장된 결과가 현재 레시피·시세와 다릅니다. (식탁)",
});
const unusedMarket = createProblem({
  code: "UNUSED_MARKET",
  severity: "info",
  productId: null,
  productName: null,
  material: "금",
  marketId: 4,
  hint: "필요 없으면 삭제하세요.",
  message: "어떤 물품도 쓰지 않는 시세입니다. (금)",
});

// 머리글을 뺀 행마다의 칸 글자
const cellTexts = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole("cell")
        .map((cell) => cell.textContent)
    );

describe("ProblemTable", () => {
  it("수준·종류를 한국어 라벨로, 설명은 문구와 힌트를 함께 서버 순서 그대로 보여 준다", () => {
    render(
      <ProblemTable problems={[missingPrice, staleResult, unusedMarket]} />
    );

    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent)
    ).toEqual(["수준", "종류", "물품", "재료·시세", "설명"]);
    expect(cellTexts()).toEqual([
      [
        "오류",
        "시세 없는 재료",
        "나무 의자",
        "원목",
        "시세 정보가 없는 재료가 있습니다. (나무 의자: 원목)새 재료라면 시세를 추가하고, 오타라면 레시피를 고치세요.",
      ],
      [
        "확인 필요",
        "결과 낡음",
        "식탁",
        "-",
        "저장된 결과가 현재 레시피·시세와 다릅니다. (식탁)'결과 다시 맞추기'를 누르세요.",
      ],
      [
        "참고",
        "쓰지 않는 시세",
        "-",
        "금",
        "어떤 물품도 쓰지 않는 시세입니다. (금)필요 없으면 삭제하세요.",
      ],
    ]);
  });

  it("renderActions가 있으면 문제마다 불러 조치 열에 둔다", () => {
    const renderActions = vi.fn((problem: CatalogProblem) =>
      problem.code === "UNUSED_MARKET" ? <button>시세 삭제</button> : null
    );
    render(
      <ProblemTable
        problems={[missingPrice, unusedMarket]}
        renderActions={renderActions}
      />
    );

    expect(screen.getAllByRole("columnheader").at(-1)).toHaveTextContent(
      "조치"
    );
    expect(renderActions.mock.calls.map(([problem]) => problem)).toEqual([
      missingPrice,
      unusedMarket,
    ]);
    const [, unusedRow] = screen.getAllByRole("row").slice(1);
    expect(
      within(unusedRow).getByRole("button", { name: "시세 삭제" })
    ).toBeInTheDocument();
  });

  it("같은 문제가 겹쳐 와도 행을 모두 보여 준다", () => {
    render(<ProblemTable problems={[missingPrice, missingPrice]} />);

    expect(screen.getAllByRole("row")).toHaveLength(3);
  });
});
