import { CartSource } from "@/domain/cart";
import { useCart } from "@/state/cart";
import { Result } from "@/types/result";
import { useToast } from "@/ui";

// 결과를 장바구니에 담고 짧게 알린다
export function useAddToCart(source: CartSource) {
  const { add } = useCart();
  const toast = useToast();

  return (item: Result) => {
    add(item, source);
    toast.success(`${item.name}을(를) 장바구니에 담았습니다.`, {
      key: "cart-add",
      duration: 1.5,
    });
  };
}
