import { Category, Tool } from "types/enums";
import { Product } from "types/product";

// 물품 하나에 넣을 수 있는 재료 수(엑셀 재료 슬롯 수)
export const MAX_MATERIAL_SLOTS = 5;

// 관리 화면 엑셀의 한 행. 재료 슬롯은 5개(nameN/baseN/countN)다.
// baseN은 Product의 basic과 의미가 반대다(1이면 하위재료가 있음).
export interface ProductExcelRow {
  id: number;
  name: string;
  level: number;
  craftingPrice: number;
  tool: Tool;
  category: Category;
  name1: string;
  base1: number;
  count1: number;
  name2?: string;
  base2?: number;
  count2?: number;
  name3?: string;
  base3?: number;
  count3?: number;
  name4?: string;
  base4?: number;
  count4?: number;
  name5?: string;
  base5?: number;
  count5?: number;
}

export function excelRowsToProducts(items: ProductExcelRow[]): Product[] {
  return items
    .map((item) => ({
      id: item.id,
      name: item.name,
      level: item.level,
      craftingPrice: item.craftingPrice,
      tool: item.tool,
      category: item.category,
      materials: [
        {
          name: item.name1,
          basic: item.base1 ? false : true,
          count: item.count1,
        },
        {
          name: item.name2 || "",
          basic: item.base2 ? false : true,
          count: item.count2 || 0,
        },
        {
          name: item.name3 || "",
          basic: item.base3 ? false : true,
          count: item.count3 || 0,
        },
        {
          name: item.name4 || "",
          basic: item.base4 ? false : true,
          count: item.count4 || 0,
        },
        {
          name: item.name5 || "",
          basic: item.base5 ? false : true,
          count: item.count5 || 0,
        },
      ].filter(({ name }) => !!name),
    }))
    .sort((a, b) => a.level - b.level);
}

export function productsToExcelRows(items: Product[]): ProductExcelRow[] {
  return items.map(({ materials, ...item }) => {
    const [m1, m2, m3, m4, m5] = materials;
    return {
      ...item,
      name1: m1.name,
      base1: m1.basic ? 0 : 1,
      count1: m1.count,
      name2: m2?.name,
      base2: m2 ? (m2.basic ? 0 : 1) : undefined,
      count2: m2?.count,
      name3: m3?.name,
      base3: m3 ? (m3.basic ? 0 : 1) : undefined,
      count3: m3?.count,
      name4: m4?.name,
      base4: m4 ? (m4.basic ? 0 : 1) : undefined,
      count4: m4?.count,
      name5: m5?.name,
      base5: m5 ? (m5.basic ? 0 : 1) : undefined,
      count5: m5?.count,
    };
  });
}

// 관리 화면에서 브라우저에 저장해 둔 물품 목록을 복원한다.
// 표 렌더링에 필요한 필드(이름·재료)를 갖춘 항목만 남기고, id는 normalizeProductIds로 보정한다.
export function parseSavedProducts(value: unknown): Product[] {
  if (!Array.isArray(value)) return [];
  return normalizeProductIds(
    value.filter(
      (item): item is Product =>
        typeof item === "object" &&
        item !== null &&
        typeof item.name === "string" &&
        Array.isArray(item.materials)
    )
  );
}

const isValidId = (id: unknown): id is number => Number.isInteger(id);

// 로컬 편집 중인 목록에서 새 행에 쓸 id(현재 최댓값 + 1). 정수가 아닌 id는 무시한다.
export function nextProductId(products: Product[]) {
  return (
    products.reduce(
      (max, { id }) => (isValidId(id) ? Math.max(max, id) : max),
      0
    ) + 1
  );
}

// 엑셀에서 가져왔거나 저장해 둔 행의 id가 없거나(정수가 아니거나) 중복이면 새 번호를 매긴다.
// 행 식별(수정·삭제·선택)이 id에 의존하므로 목록 안에서 id는 항상 고유해야 한다.
export function normalizeProductIds(products: Product[]): Product[] {
  const used = new Set<number>();
  let next = nextProductId(products);

  return products.map((product) => {
    if (isValidId(product.id) && !used.has(product.id)) {
      used.add(product.id);
      return product;
    }
    const id = next;
    next += 1;
    used.add(id);
    return { ...product, id };
  });
}

// 일괄 저장(POST /product/all) 확인용 요약. 서버는 이름 기준으로 새 물품만 추가하고
// 이미 있는 물품의 수정·삭제는 반영하지 않으므로, 마지막 저장본과 이름으로 비교한다.
export interface BulkSaveSummary {
  // 마지막 저장본에 없는 이름(서버에도 이미 있으면 서버가 건너뛴다)
  toAdd: Product[];
  // toAdd 중 같은 행의 이름만 바뀐 것(기존 물품은 남고 새 물품으로 추가된다)
  renamed: Product[];
  // 이름은 같고 내용이 바뀐 것(반영되지 않는다)
  edited: Product[];
  // 마지막 저장본에는 있었지만 지금은 없는 것(서버에서 지워지지 않는다)
  removed: Product[];
}

const nameOf = ({ name }: Product) => name.trim();
const contentOf = ({ id, ...rest }: Product) => JSON.stringify(rest);

export function summarizeBulkSave(
  lastSaved: Product[],
  current: Product[]
): BulkSaveSummary {
  const savedByName = new Map(lastSaved.map((p) => [nameOf(p), p]));
  const savedById = new Map(lastSaved.map((p) => [p.id, p]));
  const currentNames = new Set(current.map(nameOf));

  const toAdd = current.filter((p) => !savedByName.has(nameOf(p)));

  return {
    toAdd,
    renamed: toAdd.filter((p) => {
      const prev = savedById.get(p.id);
      return prev !== undefined && nameOf(prev) !== nameOf(p);
    }),
    edited: current.filter((p) => {
      const prev = savedByName.get(nameOf(p));
      return prev !== undefined && contentOf(prev) !== contentOf(p);
    }),
    removed: lastSaved.filter((p) => !currentNames.has(nameOf(p))),
  };
}
