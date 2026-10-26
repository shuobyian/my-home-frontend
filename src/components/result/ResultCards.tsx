import { ItemImage } from "@/components/common/ItemImage";
import { ResultDetail } from "@/components/result/ResultDetail";
import { styles } from "@/components/result/ResultCards.styles";
import { OwnedCounts, sumShortagePrice } from "@/domain/inventory";
import { getToolLabel } from "@/domain/labels";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { formatGold, formatNumber } from "@/lib/format";
import { useState } from "react";
import { Result } from "@/types/result";
import { Button, CartIcon, Empty, Modal, Spin, Text, Title } from "@/ui";

interface ResultCardsProps {
  loading: boolean;
  contents: Result[];
  // 담기 버튼을 누르면 호출된다(장바구니에 담기). 없으면 담기 버튼을 두지 않는다
  onAdd?: (result: Result) => void;
  // 로그인한 회원의 보유 재료. 카드에 부족 재료비를, 상세에 부족 개수를 함께 보여 준다
  owned?: OwnedCounts;
}

// 결과를 쪽 나눔 없이 모두 카드로 보여 준다. 상세(기초 재료 표)는 상세 버튼으로 여는 창에서 본다
export function ResultCards({
  loading,
  contents,
  onAdd,
  owned,
}: ResultCardsProps) {
  const [detail, setDetail] = useState<Result>();

  return (
    <Spin spinning={loading}>
      {contents.length === 0 ? (
        // 불러오는 동안에는 '데이터 없음'을 숨기고 회전 표시가 놓일 자리만 남긴다
        <div style={loading ? { visibility: "hidden" } : undefined}>
          <Empty />
        </div>
      ) : (
        <ul aria-label='결과 목록' css={styles.grid}>
          {contents.map((result) => (
            <li key={result.id} css={styles.card}>
              <ResultCardBody result={result} owned={owned} />
              <div css={styles.actions}>
                <Button
                  aria-label={`${result.name} 상세`}
                  aria-haspopup='dialog'
                  onClick={() => setDetail(result)}
                >
                  상세
                </Button>
                {onAdd && (
                  <Button
                    icon={<CartIcon />}
                    aria-label={`${result.name} 담기`}
                    onClick={() => onAdd(result)}
                  >
                    담기
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal
        open={!!detail}
        title={detail?.name}
        width={1040}
        onClose={() => setDetail(undefined)}
        footer={
          detail &&
          onAdd && (
            <Button
              variant='primary'
              icon={<CartIcon />}
              onClick={() => {
                onAdd(detail);
                setDetail(undefined);
              }}
            >
              장바구니에 담기
            </Button>
          )
        }
      >
        {detail && <ResultDetail result={detail} owned={owned} />}
      </Modal>
    </Spin>
  );
}

interface ResultCardBodyProps {
  result: Result;
  owned?: OwnedCounts;
}

// 카드 내용: 사진·물품명·도구와 레벨, 필요 금액(로그인하면 부족 재료비), 직접 재료
function ResultCardBody({ result, owned }: ResultCardBodyProps) {
  const lacking = owned ? sumShortagePrice(result.materials, owned) : 0;

  return (
    <>
      <div css={styles.head}>
        <ItemImage name={result.name} />
        <div css={styles.headText}>
          <Title level={5} style={{ margin: 0 }}>
            {result.name}
          </Title>
          <Text tone='secondary'>
            {getToolLabel(result.tool)} ·{" "}
            {requiresAffinity(result) ? "호감도 " : ""}Lv.{result.level}
          </Text>
        </div>
      </div>
      <dl css={styles.costs}>
        <dt>필요 금액</dt>
        <dd>
          <Text strong>{formatGold(getTotalCost(result))}</Text>
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
      <div css={styles.materials}>
        {result.product.materials.map((material) => (
          <span key={material.name} css={styles.material}>
            {material.name} {formatNumber(material.count)}개
          </span>
        ))}
      </div>
    </>
  );
}
