import { ROUTES } from "@/app/routes";
import { CartEntryList } from "@/components/cart/CartEntryList";
import { MaterialTable } from "@/components/result/MaterialTable";
import { CART_SOURCE_LABEL, sumPrice } from "@/domain/cart";
import { formatGold, formatNumber } from "@/lib/format";
import { useNavigate } from "react-router";
import { useCart } from "@/state/cart";
import { Button, Empty, Stack, Text, Title } from "@/ui";

// 장바구니에 담긴 물품과 기초 재료 합산 결과
export function CartSummary() {
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
          <details
            style={{
              border: "1px solid var(--ui-color-border)",
              borderRadius: "var(--ui-radius-lg)",
              overflow: "hidden",
            }}
          >
            <summary
              style={{
                padding: "var(--ui-space-3) var(--ui-space-4)",
                cursor: "pointer",
                background: "var(--ui-color-fill-alter)",
              }}
            >
              담긴 물품 ({formatNumber(totalCount)}개)
            </summary>
            <div
              style={{
                maxHeight: "300px",
                overflow: "auto",
                padding: "0 var(--ui-space-4)",
                borderTop: "1px solid var(--ui-color-border)",
              }}
            >
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
              <Text strong>총 {formatGold(totalPrice)}</Text>
            </Stack>
            <MaterialTable materials={materials} />
          </Stack>
        </Stack>
      )}
    </div>
  );
}
