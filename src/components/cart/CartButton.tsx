import { Badge, Button } from "antd";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useState } from "react";
import { useCart } from "@/state/cart";

// 헤더의 장바구니 버튼. 담긴 수량을 배지로 보여 주고 누르면 장바구니를 연다.
export function CartButton() {
  const { totalCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Badge count={totalCount}>
        <Button onClick={() => setOpen(true)}>장바구니</Button>
      </Badge>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
