import { CartSummary } from "@/components/cart/CartSummary";
import { useOwnedCounts } from "@/pages/useOwnedCounts";

export function CalculationPage() {
  const owned = useOwnedCounts();
  return <CartSummary owned={owned} />;
}
