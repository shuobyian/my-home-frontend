import { ItemImage } from "@/components/common/ItemImage";
import { OwnedCounts, sumShortagePrice } from "@/domain/inventory";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { Result } from "@/types/result";
import { formatGold, formatNumber } from "@/lib/format";
import { MaterialTable } from "@/components/result/MaterialTable";
import { styles } from "@/components/result/ResultDetail.styles";
import { Stack, Text } from "@/ui";

interface ResultDetailProps {
  result: Result;
  // 로그인한 회원의 보유 재료. 있으면 필요 금액 아래에 부족 재료비를, 기초 재료 표에 부족 개수를 함께 보여 준다
  owned?: OwnedCounts;
}

// 왼쪽에 사진·물품 정보·필요 재료 태그, 오른쪽에 기초 재료 표를 1:1 폭으로 둔다.
// 물품명은 창 제목에 있어 따로 적지 않는다.
// 두 칸이 320px씩 들어가지 않으면 표가 아래로 내려간다
export function ResultDetail({ result, owned }: ResultDetailProps) {
  const lacking = owned ? sumShortagePrice(result.materials, owned) : 0;

  return (
    <Stack gap='var(--ui-space-5)' align='flex-start' wrap>
      <Stack vertical gap='var(--ui-space-4)' style={{ flex: "1 1 320px" }}>
        <ItemImage name={result.name} variant='detail' />
        <dl css={styles.info}>
          <dt>{requiresAffinity(result) ? "필요 미미 호감도" : "필요 레벨"}</dt>
          <dd>Lv.{result.level} 이상</dd>
          <dt>필요 금액</dt>
          <dd>
            <Text strong>{formatGold(getTotalCost(result))}</Text>
            <div css={styles.breakdown}>
              재료비 {formatGold(result.totalPrice)} + 제작비{" "}
              {formatGold(result.craftingPrice)}
            </div>
          </dd>
          {owned && (
            <>
              <dt>부족 재료비</dt>
              <dd>
                {lacking > 0 ? (
                  <Text tone='danger'>{formatGold(lacking)}</Text>
                ) : (
                  <Text tone='success'>재료 충분</Text>
                )}
              </dd>
            </>
          )}
        </dl>
        <div css={styles.section}>
          <Text strong>필요 재료</Text>
          <div css={styles.materials}>
            {result.product.materials.map((material) => (
              <span key={material.name} css={styles.material}>
                {material.name} {formatNumber(material.count)}개
              </span>
            ))}
          </div>
        </div>
      </Stack>
      {/* 표가 넓으면 칸을 넓히지 않고 표 안에서 가로로 스크롤한다 */}
      <Stack vertical style={{ flex: "1 1 320px", minWidth: 0 }}>
        <Text strong>기초 재료</Text>
        <MaterialTable materials={result.materials} owned={owned} />
      </Stack>
    </Stack>
  );
}
