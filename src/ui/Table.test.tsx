import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { Table, TableColumn } from "./Table";

interface Item {
  id: number;
  name: string;
  price: number;
}

const items = (count: number): Item[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `물품 ${i + 1}`,
    price: (i + 1) * 100,
  }));

const columns: TableColumn<Item>[] = [
  { key: "name", title: "이름", render: (item) => item.name },
];
const rowKey = (item: Item) => item.id;

const page = (n: number) => screen.getByRole("button", { name: `${n} 페이지` });

describe("Table", () => {
  test("클라이언트 페이지: 다음 쪽 행을 보여 주고, data가 줄면 마지막 쪽으로 고정한다", () => {
    const { rerender } = render(
      <Table columns={columns} data={items(25)} rowKey={rowKey} />
    );

    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByText("물품 11")).toBeInTheDocument();
    expect(screen.queryByText("물품 10")).not.toBeInTheDocument();
    expect(page(2)).toHaveAttribute("aria-current", "page");

    fireEvent.click(page(3));
    rerender(<Table columns={columns} data={items(12)} rowKey={rowKey} />);

    expect(screen.getByText("물품 12")).toBeInTheDocument();
    expect(page(2)).toHaveAttribute("aria-current", "page");
  });

  test("서버 페이지: data를 자르지 않고 그대로 그리고, 이동은 onChange로 알린다", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={items(10)}
        rowKey={rowKey}
        pagination={{ page: 2, total: 50, onChange }}
      />
    );

    expect(screen.getAllByRole("row")).toHaveLength(11);
    expect(page(2)).toHaveAttribute("aria-current", "page");

    fireEvent.click(page(3));

    expect(onChange).toHaveBeenCalledWith(3, 10);
  });

  test("쪽당 개수를 바꾸면 보던 쪽을 유지하고, 그 쪽이 사라지면 마지막 쪽으로 맞춘다", () => {
    const onChange = vi.fn();
    render(
      <Table
        columns={columns}
        data={items(10)}
        rowKey={rowKey}
        pagination={{ page: 3, total: 100, showSizeChanger: true, onChange }}
      />
    );
    const sizeSelect = screen.getByRole("combobox", { name: "페이지당 개수" });

    fireEvent.change(sizeSelect, { target: { value: "20" } });
    expect(onChange).toHaveBeenLastCalledWith(3, 20);

    fireEvent.change(sizeSelect, { target: { value: "50" } });
    expect(onChange).toHaveBeenLastCalledWith(2, 50);
  });

  test("전체 개수가 한 쪽 이하이면 페이저를 숨긴다(크기 선택이 있으면 10개 기준)", () => {
    const { rerender } = render(
      <Table columns={columns} data={items(10)} rowKey={rowKey} />
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    rerender(<Table columns={columns} data={items(11)} rowKey={rowKey} />);
    expect(
      screen.getByRole("navigation", { name: "페이지 이동" })
    ).toBeInTheDocument();

    const server = { page: 1, pageSize: 20, total: 15 };
    rerender(
      <Table
        columns={columns}
        data={items(15)}
        rowKey={rowKey}
        pagination={server}
      />
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

    rerender(
      <Table
        columns={columns}
        data={items(15)}
        rowKey={rowKey}
        pagination={{ ...server, showSizeChanger: true }}
      />
    );
    expect(screen.getByRole("combobox", { name: "페이지당 개수" })).toHaveValue(
      "20"
    );
  });

  test("정렬은 오름 → 내림 → 해제로 돌고 aria-sort로 알린다", () => {
    const data = [
      { id: 1, name: "가", price: 300 },
      { id: 2, name: "나", price: 100 },
      { id: 3, name: "다", price: 200 },
    ];
    render(
      <Table
        columns={[
          ...columns,
          {
            key: "price",
            title: "가격",
            render: (item) => item.price,
            sorter: (a, b) => a.price - b.price,
          },
        ]}
        data={data}
        rowKey={rowKey}
      />
    );
    const header = screen.getByRole("columnheader", { name: "가격" });
    const names = () =>
      screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getAllByRole("cell")[0].textContent);

    fireEvent.click(screen.getByRole("button", { name: "가격" }));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    expect(names()).toEqual(["나", "다", "가"]);

    fireEvent.click(screen.getByRole("button", { name: "가격" }));
    expect(header).toHaveAttribute("aria-sort", "descending");
    expect(names()).toEqual(["가", "다", "나"]);

    fireEvent.click(screen.getByRole("button", { name: "가격" }));
    expect(header).not.toHaveAttribute("aria-sort");
    expect(names()).toEqual(["가", "나", "다"]);
  });

  test("선택은 쪽을 넘어도 유지하고, 머리글 체크박스는 현재 쪽만 넣고 뺀다", () => {
    function Selectable() {
      const [selected, setSelected] = useState<Item[]>([]);
      return (
        <>
          <output>{selected.map((item) => item.id).join(",")}</output>
          <Table
            columns={columns}
            data={items(15)}
            rowKey={rowKey}
            selection={{
              selected,
              onChange: setSelected,
              label: (item) => item.name,
            }}
          />
        </>
      );
    }
    render(<Selectable />);
    const all = () =>
      screen.getByRole("checkbox", { name: "현재 페이지 전체 선택" });

    fireEvent.click(screen.getByRole("checkbox", { name: "물품 1 선택" }));
    expect(all()).toBePartiallyChecked();

    fireEvent.click(page(2));
    expect(all()).not.toBePartiallyChecked();
    fireEvent.click(all());
    expect(screen.getByRole("status")).toHaveTextContent("1,11,12,13,14,15");

    fireEvent.click(page(1));
    expect(screen.getByRole("checkbox", { name: "물품 1 선택" })).toBeChecked();
    expect(all()).toBePartiallyChecked();

    fireEvent.click(all());
    expect(all()).toBeChecked();
    fireEvent.click(all());
    expect(screen.getByRole("status")).toHaveTextContent(/^11,12,13,14,15$/);
  });

  test("펼침 버튼으로 행 아래에 내용을 펼치고 접는다", () => {
    render(
      <Table
        columns={columns}
        data={items(2)}
        rowKey={rowKey}
        expandedRowRender={(item) => `${item.name} 상세`}
      />
    );
    const [first] = screen.getAllByRole("button", { name: "행 펼치기" });

    fireEvent.click(first);

    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAccessibleName("행 접기");
    expect(screen.getByText("물품 1 상세")).toBeInTheDocument();
    expect(screen.queryByText("물품 2 상세")).not.toBeInTheDocument();

    fireEvent.click(first);

    expect(screen.queryByText("물품 1 상세")).not.toBeInTheDocument();
  });

  test("행 클릭·Enter는 onRowClick을 부르고, 체크박스·버튼 클릭은 부르지 않는다", () => {
    const onRowClick = vi.fn();
    render(
      <Table
        columns={columns}
        data={items(2)}
        rowKey={rowKey}
        selection={{ selected: [], onChange: vi.fn(), label: (i) => i.name }}
        expandedRowRender={(item) => item.name}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "물품 1 선택" }));
    fireEvent.click(screen.getAllByRole("button", { name: "행 펼치기" })[0]);
    expect(onRowClick).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("물품 2"));
    expect(onRowClick).toHaveBeenLastCalledWith(items(2)[1]);

    fireEvent.keyDown(screen.getAllByRole("row")[1], { key: "Enter" });
    expect(onRowClick).toHaveBeenLastCalledWith(items(2)[0]);
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  test("행이 없으면 빈 상태를 보여 주고, 불러오는 동안에는 숨긴다", () => {
    const { rerender } = render(
      <Table columns={columns} data={[]} rowKey={rowKey} />
    );
    expect(screen.getByText("데이터 없음")).toBeVisible();

    rerender(
      <Table columns={columns} data={[]} rowKey={rowKey} emptyText='없음' />
    );
    expect(screen.getByText("없음")).toBeVisible();

    rerender(
      <Table
        columns={columns}
        data={[]}
        rowKey={rowKey}
        emptyText='없음'
        loading
      />
    );
    expect(screen.getByText("없음")).not.toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("불러오는 중");
  });

  test("ellipsis 열은 글자·숫자 내용일 때만 title로 전체를 보여 준다", () => {
    render(
      <Table
        columns={[
          { key: "name", title: "이름", render: (i) => i.name, ellipsis: true },
          {
            key: "tag",
            title: "표시",
            render: (i) => <b>{i.name}</b>,
            ellipsis: true,
          },
        ]}
        data={items(1)}
        rowKey={rowKey}
      />
    );
    const [name, tag] = screen.getAllByRole("cell");

    expect(name).toHaveAttribute("title", "물품 1");
    expect(tag).not.toHaveAttribute("title");
  });
});
