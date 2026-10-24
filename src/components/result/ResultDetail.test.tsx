import { render, screen } from "@testing-library/react";
import { ResultDetail } from "@/components/result/ResultDetail";
import { createResult } from "@/test/fixtures";

const result = createResult({
  materials: [
    { name: "원목", count: 200, price: 1000 },
    { name: "못", count: 10, price: 50 },
  ],
  totalPrice: 1050,
});

describe("ResultDetail", () => {
  it("보유 재료가 있으면 필요 금액 아래에 부족한 만큼의 재료비를 보여 준다", () => {
    render(<ResultDetail result={result} owned={new Map([["원목", 50]])} />);

    // 원목 150개 부족(750골드) + 못 10개 부족(50골드)
    expect(screen.getByText("부족 재료비")).toBeInTheDocument();
    expect(screen.getByText("800골드")).toBeInTheDocument();
  });

  it("보유 재료가 없으면(로그아웃) 부족 재료비를 보여 주지 않는다", () => {
    render(<ResultDetail result={result} />);

    expect(screen.getByText("필요 금액")).toBeInTheDocument();
    expect(screen.queryByText("부족 재료비")).not.toBeInTheDocument();
  });
});
