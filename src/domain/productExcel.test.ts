import { CategoryType, ToolType } from "types/enums";
import { createProduct } from "test/fixtures";
import {
  excelRowsToProducts,
  nextProductId,
  normalizeProductIds,
  parseSavedProducts,
  ProductExcelRow,
  productsToExcelRows,
  summarizeBulkSave,
} from "domain/productExcel";
import { Product } from "types/product";

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

  it("정수가 아닌 id는 무시한다(NaN을 만들지 않는다)", () => {
    const broken = { ...createProduct({ id: 2 }), id: undefined } as unknown;
    expect(nextProductId([broken as Product, createProduct({ id: 2 })])).toBe(
      3
    );
  });
});

describe("normalizeProductIds", () => {
  it("id가 없거나 중복된 행에 새 번호를 매기고 나머지는 그대로 둔다", () => {
    const a = createProduct({ id: 5, name: "A" });
    const b = {
      ...createProduct({ name: "B" }),
      id: undefined,
    } as unknown as Product;
    const c = createProduct({ id: 5, name: "C" });

    expect(
      normalizeProductIds([a, b, c]).map(({ id, name }) => [id, name])
    ).toEqual([
      [5, "A"],
      [6, "B"],
      [7, "C"],
    ]);
  });
});

describe("summarizeBulkSave", () => {
  const saved = [
    createProduct({ id: 1, name: "A" }),
    createProduct({ id: 2, name: "B" }),
    createProduct({ id: 3, name: "C" }),
  ];

  it("마지막 저장본과 이름으로 비교해 추가·이름 변경·수정·삭제를 구분한다", () => {
    const current = [
      createProduct({ id: 1, name: "A" }),
      createProduct({ id: 2, name: "B2" }),
      createProduct({ id: 3, name: "C", level: 99 }),
      createProduct({ id: 4, name: "D" }),
    ];

    const summary = summarizeBulkSave(saved, current);

    expect(summary.toAdd.map(({ name }) => name)).toEqual(["B2", "D"]);
    expect(summary.renamed.map(({ name }) => name)).toEqual(["B2"]);
    expect(summary.edited.map(({ name }) => name)).toEqual(["C"]);
    expect(summary.removed.map(({ name }) => name)).toEqual(["B"]);
  });

  it("저장한 적이 없으면 가져온 행은 모두 추가 대상이다", () => {
    expect(summarizeBulkSave([], saved).toAdd).toEqual(saved);
  });

  it("id만 바뀐 행은 변경으로 보지 않는다", () => {
    const reNumbered = saved.map((p, i) => ({ ...p, id: i + 100 }));
    expect(summarizeBulkSave(saved, reNumbered)).toEqual({
      toAdd: [],
      renamed: [],
      edited: [],
      removed: [],
    });
  });
});

describe("parseSavedProducts", () => {
  it("이름·재료를 갖춘 항목만 남기고 id가 없으면 번호를 매긴다", () => {
    const valid = createProduct({ id: 1 });
    const noId = { name: "id 없음", materials: [] };
    expect(
      parseSavedProducts([valid, noId, { name: 3, materials: [] }, null]).map(
        ({ id, name }) => [id, name]
      )
    ).toEqual([
      [1, valid.name],
      [2, "id 없음"],
    ]);
  });

  it("배열이 아니면 빈 배열", () => {
    expect(parseSavedProducts(undefined)).toEqual([]);
    expect(parseSavedProducts({})).toEqual([]);
  });
});
