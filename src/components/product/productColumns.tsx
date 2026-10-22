import { Space, TableColumnsType, Tooltip } from "antd";
import { getToolLabel } from "@/domain/labels";
import { Product } from "@/types/product";
import { formatGold } from "@/lib/format";

export const productColumns: TableColumnsType<Product> = [
  {
    title: "물품명",
    key: "name",
    dataIndex: "name",
    render: (name) => <Tooltip title={name}>{name}</Tooltip>,
    width: 140,
    fixed: "left",
  },
  {
    title: "레벨",
    key: "level",
    dataIndex: "level",
    width: 80,
  },
  {
    title: "크래프팅 가격",
    key: "craftingPrice",
    dataIndex: "craftingPrice",
    render: (craftingPrice) => formatGold(craftingPrice),
    width: 120,
  },
  {
    title: "도구",
    key: "tool",
    dataIndex: "tool",
    render: (tool) => getToolLabel(tool),
    width: 120,
  },
  {
    title: "재료",
    key: "materials",
    dataIndex: "",
    render: (item: Product) => (
      <Space orientation='vertical'>
        {item.materials
          .filter((m) => m.name)
          .map((m) => (
            <div key={m.name}>
              {m.name} / {m.basic ? "최하위재료" : "하위재료 O"} / {m.count}개
            </div>
          ))}
      </Space>
    ),
    width: 400,
  },
];
