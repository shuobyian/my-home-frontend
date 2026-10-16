import { Category, Tool } from "types/enums";
import { Product } from "types/product";

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
