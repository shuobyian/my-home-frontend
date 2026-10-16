import { App } from "antd";
import { CartSource } from "@/domain/cart";
import { useCart } from "@/state/cart";
import { Result } from "@/types/result";

// 결과를 장바구니에 담고 짧게 알린다
export function useAddToCart(source: CartSource) {
  const { add } = useCart();
  const { message } = App.useApp();

  return (item: Result) => {
    add(item, source);
    message.success({
      key: "cart-add",
      content: `${item.name}을(를) 장바구니에 담았습니다.`,
      duration: 1.5,
    });
  };
}
