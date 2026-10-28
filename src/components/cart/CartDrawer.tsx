import { ROUTES } from "@/app/routes";
import { CartEntryList } from "@/components/cart/CartEntryList";
import { CART_SOURCE_LABEL, CartScope } from "@/domain/cart";
import { formatGold } from "@/lib/format";
import { useNavigate } from "react-router";
import { useCart } from "@/state/cart";
import { Button, DeleteIcon, Drawer, NumberInput, Stack, Text } from "@/ui";

interface CartDrawerProps {
  scope: CartScope;
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ scope, open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { entries, increment, decrement, setCount, remove, clear } =
    useCart(scope);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={scope === "free" ? "시세 조작 모드 장바구니" : "장바구니"}
      extra={
        <Button
          danger
          icon={<DeleteIcon />}
          onClick={clear}
          disabled={entries.length === 0}
        >
          전체 삭제
        </Button>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "10px",
          overflow: "auto",
        }}
      >
        <CartEntryList
          entries={entries}
          emptyText='담긴 물품이 없습니다.'
          renderDescription={({ key, source, item, count }) => (
            <Stack vertical>
              <Text tone='secondary'>
                {CART_SOURCE_LABEL[source]} · 재료비{" "}
                {formatGold(item.totalPrice)}
              </Text>
              <Stack justify='space-between'>
                <Stack>
                  <Button onClick={() => decrement(key)}>-</Button>
                  <NumberInput
                    aria-label={`${item.name} 수량`}
                    style={{ width: 90 }}
                    align='center'
                    value={count}
                    min={1}
                    precision={0}
                    onChange={(value) => {
                      if (value !== null) setCount(key, value);
                    }}
                  />
                  <Button onClick={() => increment(key)}>+</Button>
                </Stack>
                <Button
                  danger
                  icon={<DeleteIcon />}
                  aria-label={`${item.name} 삭제`}
                  onClick={() => remove(key)}
                />
              </Stack>
            </Stack>
          )}
        />
        <Button
          variant='primary'
          disabled={entries.length === 0}
          onClick={() => {
            onClose();
            navigate(
              scope === "free" ? ROUTES.FREE_CALCULATION : ROUTES.CALCULATION
            );
          }}
        >
          합산
        </Button>
      </div>
    </Drawer>
  );
}
