import { CartDrawer } from "@/components/cart/CartDrawer";
import { CSSProperties, useState } from "react";
import { useCart } from "@/state/cart";
import { Button } from "@/ui";

const countStyle: CSSProperties = {
  minWidth: 20,
  padding: "0 6px",
  fontSize: "var(--ui-font-size-sm)",
  lineHeight: "20px",
  color: "var(--ui-color-text-inverse)",
  background: "var(--ui-color-danger)",
  borderRadius: 10,
};

// 헤더의 장바구니 버튼. 담긴 수량을 버튼 안에 보여 주고 누르면 장바구니를 연다.
export function CartButton() {
  const { totalCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        // 수량 표시는 숫자만 보이므로 접근 이름에는 "개"를 붙여 알린다
        aria-label={totalCount > 0 ? `장바구니 ${totalCount}개` : undefined}
        onClick={() => setOpen(true)}
      >
        장바구니
        {totalCount > 0 && (
          <span aria-hidden='true' style={countStyle}>
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </Button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
