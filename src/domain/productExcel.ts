import { Category, CategoryType, Tool, ToolType } from "types/enums";
import { Product, ProductMaterial } from "types/product";

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
  name1?: string;
  base1?: number;
  count1?: number;
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

export interface ExcelImportResult {
  products: Product[];
  // 엑셀 행 번호(헤더 다음 행이 2행)를 포함한 오류 메시지
  errors: string[];
}

const TOOLS: string[] = Object.values(ToolType);
const CATEGORIES: string[] = Object.values(CategoryType);
const SLOTS = [1, 2, 3, 4, 5] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// 서버(ProductInputSerializer) 규칙과 같은 한계값
const NAME_MAX_LENGTH = 255;
const MAX_MATERIAL_COUNT = 1_000_000;
const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

const isBlank = (value: unknown) =>
  value === undefined || value === null || String(value).trim() === "";

// 숫자 칸은 숫자나 숫자 문자열만 받는다(날짜 서식 셀·불리언 등은 거부)
function readNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

const isInt32 = (value: number) =>
  Number.isInteger(value) && value >= INT32_MIN && value <= INT32_MAX;

// 서버 규칙: 이름은 공백만 있을 수 없고 쉼표를 쓸 수 없으며 255자 이하
function readName(value: unknown): string | undefined {
  const name = String(value ?? "").trim();
  return name && !name.includes(",") && name.length <= NAME_MAX_LENGTH
    ? name
    : undefined;
}

// baseN: 비었거나 0이면 최하위재료(basic), 1이면 하위재료가 있음. 그 밖의 값은 undefined.
function readBasic(value: unknown): boolean | undefined {
  if (isBlank(value)) return true;
  const text = String(value).trim();
  if (text === "0") return true;
  if (text === "1") return false;
  return undefined;
}

// SheetJS가 행 객체에 붙여 주는 실제 행 번호(0부터, 열거되지 않는 속성).
// 빈 행을 건너뛴 시트에서도 엑셀 행 번호와 맞추기 위해 쓰고, 없으면 순서로 추정한다.
function rowNumberOf(row: unknown, index: number) {
  const rowNum = isRecord(row)
    ? (row as { __rowNum__?: unknown }).__rowNum__
    : undefined;
  return typeof rowNum === "number" ? rowNum + 1 : index + 2;
}

// 엑셀 행을 검증해 물품으로 바꾼다. 문제가 있는 행은 오류로 모으고 물품에서 뺀다.
// category가 비어 있으면 서버 기본값(NORMAL)으로 본다. 결과는 level 오름차순.
export function parseExcelRows(rows: unknown[]): ExcelImportResult {
  const products: Product[] = [];
  const errors: string[] = [];
  // 파일 안의 같은 물품명(서버는 업로드 목록 안 중복을 거부한다)
  const lineByName = new Map<string, number>();

  if (rows.length === 0) {
    return {
      products,
      errors: [
        "가져올 행이 없습니다. 첫 번째 시트에 헤더와 물품 행이 있는지 확인해주세요.",
      ],
    };
  }

  rows.forEach((row, index) => {
    const lineNumber = rowNumberOf(row, index);
    const line = `${lineNumber}행`;
    if (!isRecord(row)) {
      errors.push(`${line}: 형식이 올바르지 않습니다.`);
      return;
    }

    const rowErrors: string[] = [];
    const name = readName(row.name);
    if (!name)
      rowErrors.push("물품명이 비었거나 쉼표가 있거나 255자를 넘습니다");
    const duplicateLine = name ? lineByName.get(name) : undefined;
    if (name && duplicateLine !== undefined) {
      rowErrors.push(`${duplicateLine}행과 물품명이 같습니다`);
    } else if (name) {
      lineByName.set(name, lineNumber);
    }
    const level = readNumber(row.level);
    if (!isInt32(level)) rowErrors.push("레벨은 정수여야 합니다");
    const craftingPrice = readNumber(row.craftingPrice);
    if (!isInt32(craftingPrice))
      rowErrors.push("크래프팅 가격은 정수여야 합니다");
    const tool = String(row.tool ?? "").trim();
    if (!TOOLS.includes(tool))
      rowErrors.push(`알 수 없는 도구(${tool || "빈 값"})`);
    const category = isBlank(row.category)
      ? CategoryType.NORMAL
      : String(row.category).trim();
    if (!CATEGORIES.includes(category))
      rowErrors.push(`알 수 없는 카테고리(${category})`);

    const materials: ProductMaterial[] = [];
    SLOTS.forEach((slot) => {
      if (isBlank(row[`name${slot}`])) return;
      const materialName = readName(row[`name${slot}`]);
      const count = readNumber(row[`count${slot}`]);
      const basic = readBasic(row[`base${slot}`]);
      if (!materialName) {
        rowErrors.push(`재료${slot} 이름에 쉼표가 있거나 255자를 넘습니다`);
      } else if (
        !Number.isFinite(count) ||
        count <= 0 ||
        count > MAX_MATERIAL_COUNT
      ) {
        rowErrors.push(
          `재료${slot} 개수는 0보다 크고 ${MAX_MATERIAL_COUNT.toLocaleString()} 이하여야 합니다`
        );
      } else if (basic === undefined) {
        rowErrors.push(
          `재료${slot} base는 0(최하위재료) 또는 1(하위재료 있음)이어야 합니다`
        );
      } else {
        materials.push({ name: materialName, basic, count });
      }
    });

    if (rowErrors.length > 0) {
      errors.push(`${line}${name ? ` ${name}` : ""}: ${rowErrors.join(", ")}`);
      return;
    }

    products.push({
      id: Number(row.id),
      name: name as string,
      level,
      craftingPrice,
      tool: tool as Tool,
      category: category as Category,
      materials,
    });
  });

  return {
    products: products.sort((a, b) => a.level - b.level),
    errors,
  };
}

export function productsToExcelRows(items: Product[]): ProductExcelRow[] {
  return items.map(({ materials, ...item }) => {
    const row: ProductExcelRow = { ...item };
    SLOTS.forEach((slot, index) => {
      const material = materials[index];
      row[`name${slot}`] = material?.name;
      row[`base${slot}`] = material ? (material.basic ? 0 : 1) : undefined;
      row[`count${slot}`] = material?.count;
    });
    return row;
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
