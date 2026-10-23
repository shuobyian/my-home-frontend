import { getToolLabel } from "@/domain/labels";
import { formatGold } from "@/lib/format";
import { Product } from "@/types/product";
import { Stack, TableColumn } from "@/ui";

export const productColumns: TableColumn<Product>[] = [
  {
    title: "물품명",
    key: "name",
    render: ({ name }) => name,
    width: 140,
    fixed: true,
  },
  {
    title: "레벨",
    key: "level",
    render: ({ level }) => level,
    width: 80,
  },
  {
    title: "크래프팅 가격",
    key: "craftingPrice",
    render: ({ craftingPrice }) => formatGold(craftingPrice),
    width: 120,
  },
  {
    title: "도구",
    key: "tool",
    render: ({ tool }) => getToolLabel(tool),
    width: 120,
  },
  {
    title: "재료",
    key: "materials",
    render: ({ materials }) => (
      <Stack vertical>
        {materials
          .filter((m) => m.name)
          .map((m) => (
            <div key={m.name}>
              {m.name} / {m.basic ? "최하위재료" : "하위재료 O"} / {m.count}개
            </div>
          ))}
      </Stack>
    ),
    width: 400,
  },
];
