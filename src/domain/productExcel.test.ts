import { CategoryType, ToolType } from "@/types/enums";
import { createProduct } from "@/test/fixtures";
import {
  parseExcelRows,
  nextProductId,
  normalizeProductIds,
  parseSavedProducts,
  ProductExcelRow,
  planBulkUpload,
  productsToExcelRows,
} from "@/domain/productExcel";
import { Product } from "@/types/product";

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

// 오류 없이 변환된 물품만 본다
const toProducts = (rows: unknown[]) => parseExcelRows(rows).products;

describe("parseExcelRows - 변환", () => {
  it("엑셀 행을 Product로 변환한다", () => {
    expect(toProducts([createRow()])).toEqual([
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
    const [product] = toProducts([
      createRow({ base1: 0, name2: "천", base2: 1, count2: 2 }),
    ]);

    expect(product.materials).toEqual([
      { name: "원목", basic: true, count: 5 },
      { name: "천", basic: false, count: 2 },
    ]);
  });

  it("이름이 비어 있는 재료 슬롯은 제외한다", () => {
    const [product] = toProducts([
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
    const products = toProducts([
      createRow({ id: 1, name: "A", level: 5 }),
      createRow({ id: 2, name: "B", level: 1 }),
      createRow({ id: 3, name: "C", level: 3 }),
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

  it("재료가 없는 물품도 내려받을 수 있다(모든 슬롯이 비어 있음)", () => {
    const [row] = productsToExcelRows([createProduct({ materials: [] })]);
    expect(row.name1).toBeUndefined();
    expect(row.count5).toBeUndefined();
  });
});

describe("parseExcelRows - 검증", () => {
  it("문제가 있는 행은 행 번호와 함께 오류로 모으고 물품에서 뺀다", () => {
    const { products, errors } = parseExcelRows([
      createRow({ id: 1, name: "정상" }),
      createRow({ id: 2, name: "", level: 1.5 }),
      { ...createRow({ id: 3, name: "도구 오류" }), tool: "HAMMER" },
      createRow({ id: 4, name: "쉼표,이름" }),
      createRow({ id: 5, name: "개수 오류", count1: 0 }),
    ]);

    expect(products.map(({ name }) => name)).toEqual(["정상"]);
    expect(errors).toEqual([
      "3행: 물품명이 비었거나 쉼표가 있거나 255자를 넘습니다, 레벨은 정수여야 합니다",
      "4행 도구 오류: 알 수 없는 도구(HAMMER)",
      "5행: 물품명이 비었거나 쉼표가 있거나 255자를 넘습니다",
      "6행 개수 오류: 재료1 개수는 0보다 크고 1,000,000 이하여야 합니다",
    ]);
  });

  it("SheetJS가 붙인 실제 행 번호(__rowNum__)를 쓴다(빈 행을 건너뛴 시트)", () => {
    const row = createRow({ name: "레벨 오류", level: 1.5 });
    Object.defineProperty(row, "__rowNum__", { value: 9, enumerable: false });
    expect(parseExcelRows([createRow({ name: "정상" }), row]).errors).toEqual([
      "10행 레벨 오류: 레벨은 정수여야 합니다",
    ]);
  });

  it("서버 한계값을 넘는 값과 숫자가 아닌 셀을 거부한다", () => {
    const { errors } = parseExcelRows([
      createRow({ name: "A", count1: 1_000_001 }),
      { ...createRow({ name: "B" }), count1: "Infinity" },
      { ...createRow({ name: "C" }), level: 3_000_000_000 },
      { ...createRow({ name: "D" }), craftingPrice: new Date(2026, 0, 2) },
      createRow({ name: "가".repeat(256) }),
    ]);
    expect(errors).toHaveLength(5);
  });

  it.each([
    ["Y", false],
    [2, false],
    ["0", true],
    ["1", true],
    [" 1 ", true],
  ])("base 값 %p 허용 여부: %p", (base, valid) => {
    const { errors } = parseExcelRows([
      { ...createRow(), base1: base as unknown as number },
    ]);
    expect(errors.length === 0).toBe(valid);
  });

  it("파일 안에 같은 물품명이 있으면 두 행 번호를 함께 알려 준다", () => {
    expect(
      parseExcelRows([createRow({ name: "의자" }), createRow({ name: "의자" })])
        .errors
    ).toEqual(["3행 의자: 2행과 물품명이 같습니다"]);
  });

  it("빈 시트는 오류로 처리한다", () => {
    const { products, errors } = parseExcelRows([]);
    expect(products).toEqual([]);
    expect(errors[0]).toMatch("가져올 행이 없습니다");
  });

  it("category가 비어 있으면 서버 기본값 NORMAL로 본다", () => {
    const { products, errors } = parseExcelRows([
      { ...createRow(), category: undefined },
    ]);
    expect(errors).toEqual([]);
    expect(products[0].category).toBe(CategoryType.NORMAL);
  });

  it("객체가 아닌 행은 형식 오류", () => {
    expect(parseExcelRows([null, "x"]).errors).toEqual([
      "2행: 형식이 올바르지 않습니다.",
      "3행: 형식이 올바르지 않습니다.",
    ]);
  });

  it("이름 앞뒤 공백은 지운다", () => {
    expect(
      toProducts([createRow({ name: "  의자  ", name1: " 원목 " })])[0]
    ).toMatchObject({ name: "의자", materials: [{ name: "원목" }] });
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

    expect(toProducts(productsToExcelRows(products))).toEqual(products);
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

// 마지막 저장본 기준이던 summarizeBulkSave 사례를 서버 목록 기준으로 옮겼다.
// 지운 물품을 되살리지 않도록 서버에 없는 이름을 올린 적 있는 이름(revived)과 새 이름(toAdd)으로 나눈다.
describe("planBulkUpload", () => {
  const server = [
    createProduct({ id: 1, name: "A" }),
    createProduct({ id: 2, name: "B" }),
    createProduct({ id: 3, name: "C" }),
  ];

  it("서버 목록과 이름으로 비교해 추가·되살림·내용 다름·서버에만 있음을 구분한다", () => {
    const current = [
      createProduct({ id: 1, name: "A" }),
      createProduct({ id: 2, name: "B2" }),
      createProduct({ id: 3, name: "C", level: 99 }),
      createProduct({ id: 4, name: "D" }),
      createProduct({ id: 5, name: "E" }),
    ];

    const plan = planBulkUpload(current, server, ["A", "B", "C", "E"]);

    expect(plan.toAdd.map(({ name }) => name)).toEqual(["B2", "D"]);
    // E는 올린 적이 있는데 서버에 없다(서버에서 지워졌거나 이름이 바뀜)
    expect(plan.revived.map(({ name }) => name)).toEqual(["E"]);
    expect(plan.differs.map(({ name }) => name)).toEqual(["C"]);
    expect(plan.serverOnly).toBe(1);
  });

  it("서버가 비었고 올린 적이 없으면 모든 행이 추가 대상이다", () => {
    expect(planBulkUpload(server, [], []).toAdd).toEqual(server);
  });

  it("id만 바뀐 행은 변경으로 보지 않는다", () => {
    const reNumbered = server.map((p, i) => ({ ...p, id: i + 100 }));
    expect(planBulkUpload(reNumbered, server, [])).toEqual({
      toAdd: [],
      revived: [],
      differs: [],
      serverOnly: 0,
    });
  });

  it("서버 재료에 붙은 id 같은 필드는 비교하지 않고, 재료 내용·순서가 다르면 다르다고 본다", () => {
    const materials = [
      { name: "원목", basic: true, count: 2 },
      { name: "판자", basic: false, count: 1 },
    ];
    const serverWithIds = [
      createProduct({
        name: "식탁",
        materials: materials.map((m, i) => ({ ...m, id: i + 10 })),
      }),
    ];

    expect(
      planBulkUpload(
        [createProduct({ name: "식탁", materials })],
        serverWithIds,
        []
      ).differs
    ).toEqual([]);
    expect(
      planBulkUpload(
        [createProduct({ name: "식탁", materials: [...materials].reverse() })],
        serverWithIds,
        []
      ).differs
    ).toHaveLength(1);
  });

  it("level·craftingPrice·tool·category가 다르면 다르다고 본다", () => {
    const base = createProduct({ name: "A" });
    const changed = [
      { ...base, level: 2 },
      { ...base, craftingPrice: 1 },
      { ...base, tool: ToolType.MIMI },
      { ...base, category: CategoryType.EVENT },
    ];
    changed.forEach((product) => {
      expect(planBulkUpload([product], [base], []).differs).toEqual([product]);
    });
  });

  it("이름 앞뒤 공백은 지우고 비교한다", () => {
    const plan = planBulkUpload(
      [createProduct({ name: " A " }), createProduct({ name: "E " })],
      server,
      [" E"]
    );
    expect(plan.toAdd).toEqual([]);
    expect(plan.revived.map(({ name }) => name)).toEqual(["E "]);
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
