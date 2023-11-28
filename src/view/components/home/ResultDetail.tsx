import { Space, Typography } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { Result } from "apis/getResults";
import { StringUtil } from "util/StringUtil";
import { InfoRow } from "view/components/InfoRow";

const columns: ColumnsType<Result["basic"][0]> = [
  {
    title: "재료",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "개수",
    dataIndex: "count",
    key: "count",
    render: (count) => `${StringUtil.numberWithCommas(count)}개`,
    align: "right",
  },
  {
    title: "골드",
    dataIndex: "price",
    key: "price",
    render: (price) => `${StringUtil.numberWithCommas(price)}골드`,
    align: "right",
  },
];

interface ResultDetailProps {
  result: Result;
}

export function ResultDetail({ result }: ResultDetailProps) {
  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <Space style={{ gap: "20px", width: "100%" }} direction='vertical'>
        <Space
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Space style={{ gap: "15px" }} direction='vertical'>
            <InfoRow title='물품명' value={result.name} />
            <InfoRow
              title={
                result.name.includes("미미") ? "필요 미미 호감도" : "필요 레벨"
              }
              value={`Lv.${result.level} 이상`}
            />
            <InfoRow
              title='필요 금액'
              value={`${StringUtil.numberWithCommas(
                result.totalPrice + result.craftingPrice
              )}골드 (재료비: ${StringUtil.numberWithCommas(
                result.totalPrice
              )}골드 + 제작비: ${StringUtil.numberWithCommas(
                result.craftingPrice
              )}골드)`}
            />
            <img
              style={{ marginTop: "30px" }}
              src={`${process.env.PUBLIC_URL}/images/${result.name}.jpg`}
              width='300'
              alt='물품 사진'
            />
          </Space>
          <Space style={{ gap: "10px" }} direction='vertical'>
            {result.item.materials.map((material) => (
              <Typography.Text key={material.name} style={{ color: "blue" }}>
                {material.name} {material.count}개
              </Typography.Text>
            ))}
          </Space>
        </Space>
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Text strong>기초 재료</Typography.Text>
          <Table
            size='small'
            columns={columns}
            dataSource={result.basic.map((b) => ({ ...b, key: b.name })) || []}
            pagination={{ total: result.basic.length, showSizeChanger: true }}
          />
        </Space>
      </Space>
    </div>
  );
}
