import { render, screen } from "@testing-library/react";
import { CartEntryList } from "@/components/cart/CartEntryList";
import { CartEntry } from "@/domain/cart";
import { createResult } from "@/test/fixtures";

const entries: CartEntry[] = [
  {
    key: "server:1",
    source: "server",
    item: createResult({ id: 1, name: "나무 의자" }),
    count: 2,
  },
  {
    key: "free:2:abc",
    source: "free",
    item: createResult({ id: 2, name: "돌 탁자" }),
    count: 1,
  },
];

describe("CartEntryList", () => {
  it("담긴 물품마다 사진·이름과 설명을 보여 준다", () => {
    render(
      <CartEntryList
        entries={entries}
        renderDescription={({ count }) => `${count}개`}
      />
    );

    expect(screen.getByText("나무 의자")).toBeInTheDocument();
    expect(screen.getByText("2개")).toBeInTheDocument();
    expect(screen.getByText("돌 탁자")).toBeInTheDocument();
    expect(screen.getByText("1개")).toBeInTheDocument();
    expect(screen.getByAltText("나무 의자 사진")).toBeInTheDocument();
    // 스크린리더가 목록과 항목 수를 알 수 있게 ul/li로 그린다
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("담긴 물품이 없으면 안내 문구를 보여 준다", () => {
    render(
      <CartEntryList
        entries={[]}
        emptyText='담긴 물품이 없습니다.'
        renderDescription={() => null}
      />
    );

    expect(screen.getByText("담긴 물품이 없습니다.")).toBeInTheDocument();
  });
});
