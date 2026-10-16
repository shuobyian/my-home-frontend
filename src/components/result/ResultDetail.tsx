import { Space, theme, Typography } from "antd";
import { ItemImage } from "@/components/common/ItemImage";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { Result } from "@/types/result";
import { formatGold, formatNumber } from "@/lib/format";
import { InfoRow } from "@/components/common/InfoRow";
import { MaterialTable } from "@/components/result/MaterialTable";

interface ResultDetailProps {
  result: Result;
}

export function ResultDetail({ result }: ResultDetailProps) {
  const { token } = theme.useToken();

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
                requiresAffinity(result) ? "필요 미미 호감도" : "필요 레벨"
              }
              value={`Lv.${result.level} 이상`}
            />
            <InfoRow
              title='필요 금액'
              value={`${formatGold(getTotalCost(result))} (재료비: ${formatGold(
                result.totalPrice
              )} + 제작비: ${formatGold(result.craftingPrice)})`}
            />
            <ItemImage name={result.name} variant='detail' />
          </Space>
          <Space style={{ gap: "10px" }} direction='vertical'>
            {result.product.materials.map((material) => (
              <Typography.Text
                key={material.name}
                style={{ color: token.colorInfo }}
              >
                {material.name} {formatNumber(material.count)}개
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
