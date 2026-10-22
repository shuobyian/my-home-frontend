import { Space } from "antd";
import { CartSummary } from "@/components/cart/CartSummary";

export function CalculationPage() {
  return (
    <Space orientation='vertical' style={{ width: "100%" }}>
      <CartSummary />
    </Space>
  );
}
