import {
  aggregateMaterials,
  Cart,
  CartEntry,
  cartReducer,
  CartSource,
  migrateLegacyCart,
  parseCart,
  totalCount,
} from "@/domain/cart";
import { readJSON, removeItem, STORAGE_KEY, writeJSON } from "@/lib/storage";
import {
  createContext,
  ReactNode,
  useContext,
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

const CartContext = createContext<CartContextValue | null>(null);

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

  const value = useMemo<CartContextValue>(
    () => ({
      entries: Object.values(cart),
      totalCount: totalCount(cart),
      materials: aggregateMaterials(cart),
      add: (item, source) => dispatch({ type: "add", item, source }),
      increment: (key) => dispatch({ type: "increment", key }),
      decrement: (key) => dispatch({ type: "decrement", key }),
      setCount: (key, count) => dispatch({ type: "setCount", key, count }),
      remove: (key) => dispatch({ type: "remove", key }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart는 CartProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
