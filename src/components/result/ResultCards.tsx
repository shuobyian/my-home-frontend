import { ItemImage } from "@/components/common/ItemImage";
import { ResultDetail } from "@/components/result/ResultDetail";
import { styles } from "@/components/result/ResultCards.styles";
import { OwnedCounts, sumShortagePrice } from "@/domain/inventory";
import { getToolLabel } from "@/domain/labels";
import { getTotalCost, requiresAffinity } from "@/domain/result";
import { formatGold, formatNumber } from "@/lib/format";
import { useState } from "react";
import { Result } from "@/types/result";
import { Button, CartIcon, Empty, Modal, Pager, Spin, Text, Title } from "@/ui";

// 쪽을 카드 목록에서 나눌 때(자유 모드) 고를 수 있는 쪽당 개수. 2·3·4열로 나누어떨어진다
const PAGE_SIZES = [12, 24, 48, 96];

interface ResultCardsProps {
  loading: boolean;
  // 있으면 서버 페이지(contents는 이미 그 쪽의 결과). page는 0부터, onChange는 1부터 알린다
  pagination?: {
    page: number;
    size: number;
    total: number;
    onChange: (page: number) => void;
  };
  contents: Result[];
  // 담기 버튼을 누르면 호출된다(장바구니에 담기). 없으면 담기 버튼을 두지 않는다
  onAdd?: (result: Result) => void;
  // 로그인한 회원의 보유 재료. 카드에 부족 재료비를, 상세에 부족 개수를 함께 보여 준다
  owned?: OwnedCounts;
}

// 결과를 카드로 보여 준다. 상세(기초 재료 표)는 상세 버튼으로 여는 창에서 본다
export function ResultCards({
  loading,
  pagination,
  contents,
  onAdd,
  owned,
}: ResultCardsProps) {
  const [detail, setDetail] = useState<Result>();
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(PAGE_SIZES[0]);

  const pageSize = pagination?.size ?? clientPageSize;
  const total = pagination?.total ?? contents.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  // 결과가 줄어 보던 쪽이 사라지면 마지막 쪽으로 고정한다
  if (!pagination && clientPage > pageCount) setClientPage(pageCount);
  const page = pagination
    ? pagination.page + 1
    : Math.min(clientPage, pageCount);
  const items = pagination
    ? contents
    : contents.slice((page - 1) * pageSize, page * pageSize);

  const changePage = (nextPage: number, nextSize: number) => {
    if (pagination) {
      pagination.onChange(nextPage);
      return;
    }
    // 쪽당 개수가 늘어 보던 쪽이 사라지면 마지막 쪽으로 맞춘다
    setClientPage(Math.min(nextPage, Math.ceil(total / nextSize) || 1));
    setClientPageSize(nextSize);
  };

  return (
    <Spin spinning={loading}>
      {items.length === 0 ? (
        // 불러오는 동안에는 '데이터 없음'을 숨기고 회전 표시가 놓일 자리만 남긴다
        <div style={loading ? { visibility: "hidden" } : undefined}>
          <Empty />
        </div>
      ) : (
        <ul aria-label='결과 목록' css={styles.grid}>
          {items.map((result) => (
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
      {/* 쪽당 개수를 고를 수 있으면 가장 작은 개수보다 많을 때 보인다(고른 개수를 되돌릴 수 있게) */}
      {total > (pagination ? pageSize : PAGE_SIZES[0]) && (
        <Pager
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizes={pagination ? undefined : PAGE_SIZES}
          onChange={changePage}
        />
      )}
      <Modal
        open={!!detail}
        title={detail?.name}
        width={720}
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
