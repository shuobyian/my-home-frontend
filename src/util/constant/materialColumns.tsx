import { Space, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import { Item } from "apis/getItems";
import { getToolLabel } from "apis/type/Tool";
import { StringUtil } from "util/StringUtil";

export const materialColumns: ColumnsType<Item> = [
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
    render: (craftingPrice) =>
      StringUtil.numberWithCommasAndMoney(craftingPrice),
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
    render: (item: Item) => (
      <Space direction='vertical'>
        {item.materials.map((m) =>
          m.name ? (
            <div key={m.name}>
              {m.name} / {m.base ? "최하위재료" : "하위재료 O"} / {m.count}개
            </div>
          ) : (
            <></>
          )
        )}
      </Space>
    ),
    width: 400,
  },
];
