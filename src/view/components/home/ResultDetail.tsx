import { Space, Typography } from "antd";
import { Result } from "apis/result/getResults";
import { StringUtil } from "util/StringUtil";
import { InfoRow } from "view/components/InfoRow";
import { MaterialTable } from "view/components/shared/MaterialTable";

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
              style={{ marginTop: "10px" }}
              src={`${process.env.PUBLIC_URL}/images/${result.name}.jpg`}
              width='300'
              alt='물품 사진'
            />
          </Space>
          <Space style={{ gap: "10px" }} direction='vertical'>
            {result.product.materials.map((material) => (
              <Typography.Text key={material.name} style={{ color: "blue" }}>
                {material.name} {StringUtil.numberWithCommas(material.count)}개
              </Typography.Text>
            ))}
          </Space>
        </Space>
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Text strong>기초 재료</Typography.Text>
          <MaterialTable materials={result.materials} />
        </Space>
      </Space>
    </div>
  );
}
