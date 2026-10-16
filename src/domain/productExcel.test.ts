import { CategoryType, ToolType } from "types/enums";
import { createProduct } from "test/fixtures";
import {
  diffProducts,
  excelRowsToProducts,
  nextProductId,
  parseSavedProducts,
  ProductExcelRow,
  productsToExcelRows,
} from "domain/productExcel";

function createRow(overrides: Partial<ProductExcelRow> = {}): ProductExcelRow {
  return {
    id: 1,
    name: "나무 의자",
    level: 1,
    craftingPrice: 100,
    tool: ToolType.WOOD,
    category: CategoryType.NORMAL,
    name1: "원목",
    base1: 0,
    count1: 5,
    ...overrides,
  };
}

describe("excelRowsToProducts", () => {
  it("엑셀 행을 Product로 변환한다", () => {
    expect(excelRowsToProducts([createRow()])).toEqual([
      {
        id: 1,
        name: "나무 의자",
        level: 1,
        craftingPrice: 100,
        tool: ToolType.WOOD,
        category: CategoryType.NORMAL,
        materials: [{ name: "원목", basic: true, count: 5 }],
      },
    ]);
  });

  it("baseN이 0이면 basic: true, 1이면 basic: false다 (의미가 반대)", () => {
    const [product] = excelRowsToProducts([
      createRow({ base1: 0, name2: "천", base2: 1, count2: 2 }),
    ]);

    expect(product.materials).toEqual([
      { name: "원목", basic: true, count: 5 },
      { name: "천", basic: false, count: 2 },
    ]);
  });

  it("이름이 비어 있는 재료 슬롯은 제외한다", () => {
    const [product] = excelRowsToProducts([
      createRow({
        name2: "",
        count2: 3,
        name3: "돌",
        base3: 0,
        count3: 4,
        name5: "철",
        base5: 1,
        count5: 1,
      }),
    ]);

    expect(product.materials.map(({ name }) => name)).toEqual([
      "원목",
      "돌",
      "철",
    ]);
  });

  it("level 오름차순으로 정렬한다", () => {
    const products = excelRowsToProducts([
      createRow({ id: 1, level: 5 }),
      createRow({ id: 2, level: 1 }),
      createRow({ id: 3, level: 3 }),
    ]);

    expect(products.map(({ id }) => id)).toEqual([2, 3, 1]);
  });
});

describe("productsToExcelRows", () => {
  it("Product를 엑셀 행으로 변환하고 없는 슬롯은 undefined로 둔다", () => {
    const product = createProduct({
      materials: [
        { name: "원목", basic: true, count: 5 },
        { name: "천", basic: false, count: 2 },
      ],
    });

    const rows = productsToExcelRows([product]);

    // 엑셀 열 순서는 키 순서를 따르므로 슬롯 열의 존재와 순서를 고정한다.
    expect(Object.keys(rows[0]).slice(-15)).toEqual([
      "name1",
      "base1",
      "count1",
      "name2",
      "base2",
      "count2",
      "name3",
      "base3",
      "count3",
      "name4",
      "base4",
      "count4",
      "name5",
      "base5",
      "count5",
    ]);
    // toStrictEqual: 없는 슬롯도 키는 존재하고 값이 undefined인지까지 확인한다.
    expect(rows).toStrictEqual([
      {
        id: product.id,
        name: product.name,
        level: product.level,
        craftingPrice: product.craftingPrice,
        tool: product.tool,
        category: product.category,
        name1: "원목",
        base1: 0,
        count1: 5,
        name2: "천",
        base2: 1,
        count2: 2,
        name3: undefined,
        base3: undefined,
        count3: undefined,
        name4: undefined,
        base4: undefined,
        count4: undefined,
        name5: undefined,
        base5: undefined,
        count5: undefined,
      },
    ]);
  });

  // 현재 동작을 기록한다. 빈 재료를 허용하도록 고칠 때 함께 갱신한다 (R19).
  it("재료가 없는 Product는 TypeError를 던진다 (현재 동작)", () => {
    expect(() =>
      productsToExcelRows([createProduct({ materials: [] })])
    ).toThrow(TypeError);
  });
});

describe("엑셀 왕복 변환", () => {
  it("재료 1~5개와 category가 그대로 보존된다", () => {
    const materials = [
      { name: "원목", basic: true, count: 5 },
      { name: "천", basic: false, count: 2 },
      { name: "돌", basic: true, count: 4 },
      { name: "철", basic: false, count: 1 },
      { name: "유리", basic: true, count: 3 },
    ];
    const products = materials.map((_, i) =>
      createProduct({
        id: i + 1,
        name: `물품${i + 1}`,
        level: i + 1,
        category: i % 2 === 0 ? CategoryType.NORMAL : CategoryType.EVENT,
        materials: materials.slice(0, i + 1),
      })
    );

    expect(excelRowsToProducts(productsToExcelRows(products))).toEqual(
      products
    );
  });
});

describe("nextProductId", () => {
  it("현재 최댓값 + 1을 반환한다(앞에 추가해도 중복되지 않는다)", () => {
    expect(nextProductId([])).toBe(1);
    expect(
      nextProductId([createProduct({ id: 7 }), createProduct({ id: 3 })])
    ).toBe(8);
  });
});

describe("diffProducts", () => {
  it("id 기준으로 추가·수정·삭제를 구분한다", () => {
    const a = createProduct({ id: 1, name: "A" });
    const b = createProduct({ id: 2, name: "B" });
    const c = createProduct({ id: 3, name: "C" });
    const bEdited = { ...b, level: 99 };
    const d = createProduct({ id: 4, name: "D" });

    expect(diffProducts([a, b, c], [d, a, bEdited])).toEqual({
      added: [d],
      updated: [bEdited],
      removed: [c],
    });
  });

  it("변경이 없으면 모두 빈 배열", () => {
    const list = [createProduct({ id: 1 })];
    expect(diffProducts(list, JSON.parse(JSON.stringify(list)))).toEqual({
      added: [],
      updated: [],
      removed: [],
    });
  });
});

describe("parseSavedProducts", () => {
  it("표에 필요한 필드를 갖춘 항목만 남긴다", () => {
    const valid = createProduct({ id: 1 });
    expect(
      parseSavedProducts([valid, { id: "2", name: "x", materials: [] }, null])
    ).toEqual([valid]);
  });

  it("배열이 아니면 빈 배열", () => {
    expect(parseSavedProducts(undefined)).toEqual([]);
    expect(parseSavedProducts({})).toEqual([]);
  });
});
