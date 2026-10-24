import {
  CatalogNames,
  classifyMaterial,
  findUploadProblems,
  inferBasic,
  parseNameList,
  statusByProductId,
  toCatalogNames,
} from "@/domain/catalog";
import {
  createCatalogCheck,
  createProblem,
  createProduct,
} from "@/test/fixtures";

// 시세: 원목·천·판자(물품과 이름 겹침), 물품: 의자·판자
const names: CatalogNames = {
  markets: new Set(["원목", "천", "판자"]),
  products: new Set(["의자", "판자"]),
};

describe("classifyMaterial", () => {
  it.each([
    [{ name: "원목", basic: true }, "ok"],
    [{ name: "판자", basic: true }, "ambiguous"],
    [{ name: "의자", basic: true }, "product-as-basic"],
    [{ name: "은", basic: true }, "missing-market"],
    [{ name: "의자", basic: false }, "ok"],
    [{ name: "판자", basic: false }, "ok"],
    [{ name: "천", basic: false }, "market-as-sub"],
    [{ name: "없는물품", basic: false }, "unknown-product"],
  ] as const)("%o → %s", (material, ref) => {
    expect(classifyMaterial(material, names)).toBe(ref);
  });

  it("하위재료 O로 자기 이름을 쓰면 self다(물품에 있어도)", () => {
    expect(
      classifyMaterial({ name: "의자", basic: false }, names, "의자")
    ).toBe("self");
    expect(
      classifyMaterial({ name: "새물품", basic: false }, names, " 새물품 ")
    ).toBe("self");
  });

  it("이름 앞뒤 공백은 지우고 비교한다", () => {
    expect(classifyMaterial({ name: " 원목 ", basic: true }, names)).toBe("ok");
  });

  it("이름이 비었거나 하위재료 여부를 고르지 않았으면 undefined", () => {
    expect(classifyMaterial({ name: "원목" }, names)).toBeUndefined();
    expect(
      classifyMaterial({ name: "  ", basic: true }, names)
    ).toBeUndefined();
    expect(classifyMaterial({ basic: true }, names)).toBeUndefined();
  });
});

describe("inferBasic", () => {
  it("물품에만 있으면 false, 시세에만 있으면 true, 둘 다거나 없으면 undefined", () => {
    expect(inferBasic("의자", names)).toBe(false);
    expect(inferBasic(" 원목 ", names)).toBe(true);
    expect(inferBasic("판자", names)).toBeUndefined();
    expect(inferBasic("은", names)).toBeUndefined();
    expect(inferBasic("", names)).toBeUndefined();
  });
});

describe("toCatalogNames", () => {
  it("점검 결과의 시세·물품 이름을 모은다", () => {
    const check = createCatalogCheck({
      products: [
        { id: 1, name: "의자", status: "ok", resultId: 1 },
        { id: 2, name: "판자", status: "error", resultId: null },
      ],
      markets: [{ id: 3, name: "원목", price: 5, usedBy: [] }],
    });

    const result = toCatalogNames(check);

    expect([...result.products]).toEqual(["의자", "판자"]);
    expect([...result.markets]).toEqual(["원목"]);
  });
});

describe("statusByProductId", () => {
  it("물품 id별 상태와 그 물품의 오류·경고 문구를 모은다(참고 문제는 빼고)", () => {
    const check = createCatalogCheck({
      products: [
        { id: 1, name: "의자", status: "error", resultId: 1 },
        { id: 2, name: "판자", status: "missing", resultId: null },
        { id: 3, name: "책상", status: "ok", resultId: 3 },
      ],
      problems: [
        createProblem({ productId: 1, message: "시세 없음 (의자: 은)" }),
        createProblem({ productId: 1, message: "시세 없음 (의자: 금)" }),
        createProblem({
          code: "MISSING_RESULT",
          severity: "warning",
          productId: 2,
          message: "결과가 없습니다. (판자)",
        }),
        createProblem({
          code: "UNUSED_MARKET",
          severity: "info",
          productId: null,
          message: "어떤 물품도 쓰지 않는 시세입니다. (금)",
        }),
      ],
    });

    const statuses = statusByProductId(check);

    expect(statuses.get(1)).toEqual({
      status: "error",
      messages: ["시세 없음 (의자: 은)", "시세 없음 (의자: 금)"],
    });
    expect(statuses.get(2)).toEqual({
      status: "missing",
      messages: ["결과가 없습니다. (판자)"],
    });
    expect(statuses.get(3)).toEqual({ status: "ok", messages: [] });
    expect(statuses.get(99)).toBeUndefined();
  });
});

describe("findUploadProblems", () => {
  const server: CatalogNames = {
    markets: new Set(["원목", "천"]),
    products: new Set(["의자"]),
  };
  const withUploads = (...uploadNames: string[]): CatalogNames => ({
    markets: server.markets,
    products: new Set([...server.products, ...uploadNames]),
  });

  it("같은 업로드 안의 물품을 하위재료로 쓰는 것은 허용한다", () => {
    const rows = [
      createProduct({
        name: "판자",
        materials: [{ name: "원목", basic: true, count: 2 }],
      }),
      createProduct({
        name: "식탁",
        materials: [
          { name: "판자", basic: false, count: 1 },
          { name: "의자", basic: false, count: 4 },
        ],
      }),
    ];

    expect(findUploadProblems(rows, withUploads("판자", "식탁"))).toEqual({
      missingMarkets: [],
      rowProblems: [],
    });
  });

  it("시세 없는 재료를 처음 나온 순서로 모으고 쓰는 물품을 중복 없이 붙인다", () => {
    const rows = [
      createProduct({
        name: "반지",
        materials: [
          { name: "은", basic: true, count: 1 },
          { name: "금", basic: true, count: 1 },
          { name: "은", basic: true, count: 2 },
        ],
      }),
      createProduct({
        name: "목걸이",
        materials: [{ name: " 은 ", basic: true, count: 1 }],
      }),
    ];

    expect(
      findUploadProblems(rows, withUploads("반지", "목걸이")).missingMarkets
    ).toEqual([
      { name: "은", usedBy: ["반지", "목걸이"] },
      { name: "금", usedBy: ["반지"] },
    ]);
  });

  it("서버가 거절할 참조 4종만 행 문제로 모은다(같은 이름 물품·시세 겹침은 빼고)", () => {
    const rows = [
      createProduct({
        name: "식탁",
        materials: [
          { name: "의자", basic: true, count: 1 },
          { name: "없는물품", basic: false, count: 1 },
          { name: "천", basic: false, count: 1 },
          { name: "식탁", basic: false, count: 1 },
          { name: "원목", basic: true, count: 1 },
          // 시세와 물품에 모두 있는 이름(ambiguous)은 경고일 뿐 거절되지 않는다
          { name: "판자", basic: true, count: 1 },
        ],
      }),
    ];
    const uploadNames: CatalogNames = {
      markets: new Set([...server.markets, "판자"]),
      products: new Set([...server.products, "판자", "식탁"]),
    };

    expect(findUploadProblems(rows, uploadNames).rowProblems).toEqual([
      { product: "식탁", material: "의자", ref: "product-as-basic" },
      { product: "식탁", material: "없는물품", ref: "unknown-product" },
      { product: "식탁", material: "천", ref: "market-as-sub" },
      { product: "식탁", material: "식탁", ref: "self" },
    ]);
  });
});

describe("parseNameList", () => {
  it("문자열 배열이면 그대로 반환한다", () => {
    const list = ["의자", "판자"];
    expect(parseNameList(list)).toBe(list);
    expect(parseNameList([])).toEqual([]);
  });

  it.each([undefined, null, "의자", {}, ["의자", 3]])(
    "형태가 맞지 않으면(%p) undefined",
    (value) => {
      expect(parseNameList(value)).toBeUndefined();
    }
  );
});
