import { render, screen, within } from "@testing-library/react";
import { MaterialTable } from "@/components/result/MaterialTable";

const materials = [
  { name: "원목", count: 200, price: 1000 },
  { name: "못", count: 10, price: 50 },
  { name: "천", count: 5, price: 25 },
];

// 첫 칸이 재료 이름인 행의 칸 글자
const cellsOf = (name: string) =>
  screen
    .getAllByRole("row")
    .map((row) =>
      within(row)
        .queryAllByRole("cell")
        .map((cell) => cell.textContent)
    )
    .find((cells) => cells[0] === name);

describe("MaterialTable", () => {
  it("보유 재료가 없으면(로그아웃) 보유 열과 부족 표시 없이 보여 준다", () => {
    render(<MaterialTable materials={materials} />);

    expect(
      screen.queryByRole("columnheader", { name: "보유" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/부족/)).not.toBeInTheDocument();
    expect(cellsOf("원목")).toEqual(["원목", "200개", "2.02뭉", "1,000골드"]);
  });

  it("뭉으로 묶고 낱개가 남으면 그 개수를 소수 두 자리로 붙인다", () => {
    render(
      <MaterialTable
        materials={[
          { name: "고래", count: 145, price: 1450 },
          { name: "고무", count: 304, price: 3040 },
          { name: "꽁치", count: 315.5, price: 3155 },
          { name: "돌", count: 198, price: 990 },
          { name: "천", count: 5, price: 25 },
        ]}
      />
    );

    expect(cellsOf("고래")?.[2]).toBe("1.46뭉");
    expect(cellsOf("고무")?.[2]).toBe("3.07뭉");
    // 소수 개수의 낱개(18.5개)는 버린다
    expect(cellsOf("꽁치")?.[2]).toBe("3.18뭉");
    expect(cellsOf("돌")?.[2]).toBe("2뭉");
    expect(cellsOf("천")?.[2]).toBe("-");
  });

  it("보유 재료가 있으면 보유 열을 더하고, 개수·뭉·골드 왼쪽에 부족한 만큼을 작게 붙인다(넉넉하면 붙이지 않는다)", () => {
    render(
      <MaterialTable
        materials={materials}
        owned={
          new Map([
            ["원목", 50],
            ["못", 30],
          ])
        }
      />
    );

    // 원목 200개 중 50개 보유: 150개(1뭉 51개) 부족, 1,000골드 중 750골드어치
    expect(cellsOf("원목")).toEqual([
      "원목",
      "(150개 부족) 200개",
      "50개",
      "(1.51뭉 부족) 2.02뭉",
      "(750골드 부족) 1,000골드",
    ]);
    expect(screen.getByText("(150개 부족)")).toBeInTheDocument();
    expect(cellsOf("못")).toEqual(["못", "10개", "30개", "-", "50골드"]);
    // 1뭉이 안 되게 부족하면 뭉에는 붙이지 않는다
    expect(cellsOf("천")).toEqual([
      "천",
      "(5개 부족) 5개",
      "0개",
      "-",
      "(25골드 부족) 25골드",
    ]);
  });
});
