import {
  aggregateMaterials,
  Cart,
  CartAction,
  CartEntry,
  cartOfScope,
  cartReducer,
  CartScope,
  CartSource,
  migrateLegacyCart,
  parseCart,
  totalCount,
} from "@/domain/cart";
import { readJSON, removeItem, STORAGE_KEY, writeJSON } from "@/lib/storage";
import {
  createContext,
  Dispatch,
  ReactNode,
  use,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { MaterialCost, Result } from "@/types/result";

interface CartContextValue {
  entries: CartEntry[];
  totalCount: number;
  materials: MaterialCost[];
  add: (item: Result, source: CartSource) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  setCount: (key: string, count: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<{
  cart: Cart;
  dispatch: Dispatch<CartAction>;
} | null>(null);

// 저장된 장바구니를 읽는다. 새 형식이 없으면 이전 형식을 변환한다.
function loadCart(): Cart {
  const saved = readJSON(STORAGE_KEY.CART);
  if (saved !== undefined) return parseCart(saved);
  return migrateLegacyCart(readJSON(STORAGE_KEY.LEGACY_CART));
}

// 앱 전역 장바구니. 바뀔 때마다 localStorage에 저장해 새로고침·이동 후에도 유지한다.
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    // 새 형식으로 저장에 성공했을 때만 이전 형식을 지운다(실패하면 다음에 다시 옮긴다)
    if (writeJSON(STORAGE_KEY.CART, cart)) {
      removeItem(STORAGE_KEY.LEGACY_CART);
    }
  }, [cart]);

  const value = useMemo(() => ({ cart, dispatch }), [cart]);

  return <CartContext value={value}>{children}</CartContext>;
}

// scope를 주면 그 구분(홈·자유 모드)에 담긴 항목만 보여 주고 비운다. 없으면 장바구니 전체다
export function useCart(scope?: CartScope) {
  const context = use(CartContext);
  const value = useMemo<CartContextValue | null>(() => {
    if (!context) return null;
    const { dispatch } = context;
    const cart = scope ? cartOfScope(context.cart, scope) : context.cart;
    return {
      entries: Object.values(cart),
      totalCount: totalCount(cart),
      materials: aggregateMaterials(cart),
      add: (item, source) => dispatch({ type: "add", item, source }),
      increment: (key) => dispatch({ type: "increment", key }),
      decrement: (key) => dispatch({ type: "decrement", key }),
      setCount: (key, count) => dispatch({ type: "setCount", key, count }),
      remove: (key) => dispatch({ type: "remove", key }),
      clear: () => dispatch({ type: "clear", scope }),
    };
  }, [context, scope]);
  if (!value) {
    throw new Error("useCart는 CartProvider 안에서만 사용할 수 있습니다.");
  }
  return value;
}
