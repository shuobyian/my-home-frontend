import { Item, RawItem } from "apis/getItems";

export function convertExcelToTable(items: RawItem[]): Item[] {
  return items
    .map((item) => ({
      id: item.id,
      name: item.name,
      level: item.level,
      craftingPrice: item.craftingPrice,
      tool: item.tool,
      materials: [
        {
          name: item.name1,
          base: item.base1 ? false : true,
          count: item.count1,
        },
        {
          name: item.name2 || "",
          base: item.base2 ? false : true,
          count: item.count2 || 0,
        },
        {
          name: item.name3 || "",
          base: item.base3 ? false : true,
          count: item.count3 || 0,
        },
        {
          name: item.name4 || "",
          base: item.base4 ? false : true,
          count: item.count4 || 0,
        },
        {
          name: item.name5 || "",
          base: item.base5 ? false : true,
          count: item.count5 || 0,
        },
      ].filter(({ name }) => !!name),
    }))
    .sort((a, b) => a.level - b.level);
}

export function convertTableToExcel(items: Item[]): RawItem[] {
  return items.map(({ materials, ...item }) => {
    const [m1, m2, m3, m4, m5] = materials;
    return {
      ...item,
      name1: m1.name,
      base1: m1.base ? 0 : 1,
      count1: m1.count,
      name2: m2?.name,
      base2: m2 ? (m2.base ? 0 : 1) : undefined,
      count2: m2?.count,
      name3: m3?.name,
      base3: m3 ? (m3.base ? 0 : 1) : undefined,
      count3: m3?.count,
      name4: m4?.name,
      base4: m4 ? (m4.base ? 0 : 1) : undefined,
      count4: m4?.count,
      name5: m5?.name,
      base5: m5 ? (m5.base ? 0 : 1) : undefined,
      count5: m5?.count,
    };
  });
}
