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
  it("보유 재료가 없으면(로그아웃) 보유·부족 열 없이 보여 준다", () => {
    render(<MaterialTable materials={materials} />);

    expect(
      screen.queryByRole("columnheader", { name: "보유" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "부족 개수" })
    ).not.toBeInTheDocument();
    expect(cellsOf("원목")).toEqual(["원목", "200개", "2뭉", "1,000골드"]);
  });

  it("보유 재료가 있으면 원래 개수·뭉·골드 뒤에 보유 개수와 부족 개수·뭉·골드(넉넉하면 0)를 보여 준다", () => {
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

    expect(cellsOf("원목")).toEqual([
      "원목",
      "200개",
      "2뭉",
      "1,000골드",
      "50개",
      "150개",
      "1뭉",
      "750골드",
    ]);
    expect(cellsOf("못")).toEqual([
      "못",
      "10개",
      "-",
      "50골드",
      "30개",
      "0개",
      "-",
      "0골드",
    ]);
    expect(cellsOf("천")).toEqual([
      "천",
      "5개",
      "-",
      "25골드",
      "0개",
      "5개",
      "-",
      "25골드",
    ]);
  });
});
