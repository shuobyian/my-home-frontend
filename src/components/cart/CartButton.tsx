import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartScope } from "@/domain/cart";
import { CSSProperties, useState } from "react";
import { useCart } from "@/state/cart";
import { Button, CartIcon } from "@/ui";

const countStyle: CSSProperties = {
  minWidth: 20,
  padding: "0 6px",
  fontSize: "var(--ui-font-size-sm)",
  lineHeight: "20px",
  color: "var(--ui-color-text-inverse)",
  background: "var(--ui-color-danger)",
  borderRadius: 10,
};

// 장바구니 버튼. 담긴 수량을 버튼 안에 보여 주고 누르면 장바구니(서랍)를 연다.
// 물품을 담는 화면(홈·자유 모드)에 놓고, 그 화면의 장바구니(scope)만 보여 준다.
export function CartButton({ scope }: { scope: CartScope }) {
  const { totalCount } = useCart(scope);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        icon={<CartIcon />}
        aria-haspopup='dialog'
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
      <CartDrawer scope={scope} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
