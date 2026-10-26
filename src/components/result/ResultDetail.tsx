import { ItemImage } from "@/components/common/ItemImage";
import { OwnedCounts, sumShortagePrice } from "@/domain/inventory";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { Result } from "@/types/result";
import { formatGold, formatNumber } from "@/lib/format";
import { InfoRow } from "@/components/common/InfoRow";
import { MaterialTable } from "@/components/result/MaterialTable";
import { Stack, Text } from "@/ui";

interface ResultDetailProps {
  result: Result;
  // 로그인한 회원의 보유 재료. 있으면 필요 금액 아래에 부족 재료비를, 기초 재료 표에 부족 개수를 함께 보여 준다
  owned?: OwnedCounts;
}

// 왼쪽에 물품 정보·사진·직접 재료, 오른쪽에 기초 재료 표. 좁으면 표가 아래로 내려간다
export function ResultDetail({ result, owned }: ResultDetailProps) {
  return (
    <Stack gap={24} align='flex-start' wrap>
      <Stack vertical gap={15} align='flex-start' style={{ flex: "0 1 300px" }}>
        <InfoRow title='물품명' value={result.name} />
        <InfoRow
          title={requiresAffinity(result) ? "필요 미미 호감도" : "필요 레벨"}
          value={`Lv.${result.level} 이상`}
        />
        <InfoRow
          title='필요 금액'
          value={`${formatGold(getTotalCost(result))} (재료비: ${formatGold(
            result.totalPrice
          )} + 제작비: ${formatGold(result.craftingPrice)})`}
        />
        {owned && (
          <InfoRow
            title='부족 재료비'
            value={formatGold(sumShortagePrice(result.materials, owned))}
          />
        )}
        <ItemImage name={result.name} variant='detail' />
        {result.product.materials.map((material) => (
          <Text key={material.name} tone='info'>
            {material.name} {formatNumber(material.count)}개
          </Text>
        ))}
      </Stack>
      {/* 표가 남은 폭을 채우고, 400px보다 좁아지면 줄을 바꿔 아래로 간다 */}
      <Stack vertical style={{ flex: "1 1 400px", minWidth: 0 }}>
        <Text strong>기초 재료</Text>
        <MaterialTable materials={result.materials} owned={owned} />
      </Stack>
    </Stack>
  );
}
