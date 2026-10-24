import { ItemImage } from "@/components/common/ItemImage";
import { OwnedCounts } from "@/domain/inventory";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { Result } from "@/types/result";
import { formatGold, formatNumber } from "@/lib/format";
import { InfoRow } from "@/components/common/InfoRow";
import { MaterialTable } from "@/components/result/MaterialTable";
import { Stack, Text } from "@/ui";

interface ResultDetailProps {
  result: Result;
  // 로그인한 회원의 보유 재료. 있으면 기초 재료 표에 부족 개수를 함께 보여 준다
  owned?: OwnedCounts;
}

export function ResultDetail({ result, owned }: ResultDetailProps) {
  return (
    <Stack vertical gap={20}>
      <Stack justify='space-between' align='baseline' gap={20} wrap>
        <Stack vertical gap={15} align='flex-start'>
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
          <ItemImage name={result.name} variant='detail' />
        </Stack>
        <Stack vertical gap={10} align='flex-start'>
          {result.product.materials.map((material) => (
            <Text key={material.name} tone='info'>
              {material.name} {formatNumber(material.count)}개
            </Text>
          ))}
        </Stack>
      </Stack>
      <Stack vertical>
        <Text strong>기초 재료</Text>
        <MaterialTable materials={result.materials} owned={owned} />
      </Stack>
    </Stack>
  );
}
