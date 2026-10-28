import { CartSummary } from "@/components/cart/CartSummary";
import { CartScope } from "@/domain/cart";
import { useOwnedCounts } from "@/pages/useOwnedCounts";

export function CalculationPage({ scope }: { scope: CartScope }) {
  const owned = useOwnedCounts();
  return <CartSummary scope={scope} owned={owned} />;
}
