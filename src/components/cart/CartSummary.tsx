import { ROUTES } from "@/app/routes";
import { CartEntryList } from "@/components/cart/CartEntryList";
import { MaterialTable } from "@/components/result/MaterialTable";
import { ShortageText } from "@/components/common/ShortageText";
import { CART_SOURCE_LABEL, sumPrice } from "@/domain/cart";
import { OwnedCounts, sumShortagePrice } from "@/domain/inventory";
import { formatGold, formatNumber } from "@/lib/format";
import { useNavigate } from "react-router";
import { useCart } from "@/state/cart";
import { Button, Empty, Stack, Text, Title } from "@/ui";
import { styles } from "./CartSummary.styles";

interface CartSummaryProps {
  // 로그인한 회원의 보유 재료. 있으면 합산한 기초 재료 표에 부족 개수를, 총 가격 왼쪽에 부족한 만큼의 가격을 함께 보여 준다
  owned?: OwnedCounts;
}

// 장바구니에 담긴 물품과 기초 재료 합산 결과
export function CartSummary({ owned }: CartSummaryProps) {
  const navigate = useNavigate();
  const { entries, totalCount, materials } = useCart();
  const totalPrice = sumPrice(materials);

  return (
    <div style={{ width: "100%" }}>
      <Title level={3}>물품 합산 결과</Title>
      <Title level={5}>담긴 물품은 삭제하기 전까지 유지됩니다.</Title>
      {entries.length === 0 ? (
        <Empty description='장바구니에 담긴 물품이 없습니다.'>
          <Button variant='primary' onClick={() => navigate(ROUTES.HOME)}>
            물품 담으러 가기
          </Button>
        </Empty>
      ) : (
        <Stack vertical>
          <Text tone='secondary'>
            가격은 물품을 담은 시점의 시세로 계산됩니다.
          </Text>
          <details css={styles.entries}>
            <summary css={styles.summary}>
              담긴 물품 ({formatNumber(totalCount)}개)
            </summary>
            <div css={styles.list}>
              <CartEntryList
                entries={entries}
                renderDescription={({ source, count }) => (
                  <Text tone='secondary'>
                    {formatNumber(count)}개 · {CART_SOURCE_LABEL[source]}
                  </Text>
                )}
              />
            </div>
          </details>
          <Stack vertical>
            <Stack justify='space-between'>
              <Text strong>기초 재료</Text>
              <Stack wrap justify='flex-end' align='baseline'>
                {owned && (
                  <ShortageText>
                    {formatGold(sumShortagePrice(materials, owned))}
                  </ShortageText>
                )}
                <Text strong>총 {formatGold(totalPrice)}</Text>
              </Stack>
            </Stack>
            <MaterialTable materials={materials} owned={owned} />
          </Stack>
        </Stack>
      )}
    </div>
  );
}
