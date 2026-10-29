import { ItemImage } from "@/components/common/ItemImage";
import { ResultDetail } from "@/components/result/ResultDetail";
import { styles } from "@/components/result/ResultCards.styles";
import { OwnedCounts, sumShortagePrice } from "@/domain/inventory";
import { getToolLabel } from "@/domain/labels";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { formatGold } from "@/lib/format";
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
    <section aria-label='제작 물품'>
      <div css={styles.heading}>
        <Title level={2}>제작 물품</Title>
        <span css={styles.count}>
          {loading ? "조회 중" : `${contents.length}개`}
        </span>
      </div>
      <Spin spinning={loading}>
        {contents.length === 0 ? (
          // 불러오는 동안에는 '데이터 없음'을 숨기고 회전 표시가 놓일 자리만 남긴다
          <div style={loading ? { visibility: "hidden" } : undefined}>
            <Empty description='조건에 맞는 물품이 없습니다. 검색어와 필터를 확인해 주세요.' />
          </div>
        ) : (
          <ul aria-label='결과 목록' css={styles.grid}>
            {contents.map((result) => (
              <li key={result.id} css={styles.card}>
                <ItemImage name={result.name} variant='cover' />
                <div css={styles.body}>
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
                        css={styles.add}
                        icon={<CartIcon />}
                        aria-label={`${result.name} 담기`}
                        onClick={() => onAdd(result)}
                      >
                        담기
                      </Button>
                    )}
                  </div>
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
    </section>
  );
}

interface ResultCardBodyProps {
  result: Result;
  owned?: OwnedCounts;
}

// 사진 아래 카드 내용: 물품명·도구와 레벨, 필요 금액(로그인하면 부족 재료비). 필요 재료는 상세에서 본다
function ResultCardBody({ result, owned }: ResultCardBodyProps) {
  const lacking = owned ? sumShortagePrice(result.materials, owned) : 0;

  return (
    <>
      <div>
        <Title level={3} css={styles.name}>
          {result.name}
        </Title>
        <Text tone='secondary'>
          {getToolLabel(result.tool)} ·{" "}
          {requiresAffinity(result) ? "호감도 " : ""}Lv.{result.level}
        </Text>
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
    </>
  );
}
