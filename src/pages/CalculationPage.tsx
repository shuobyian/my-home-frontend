import { Space } from "antd";
import { CartSummary } from "components/cart/CartSummary";

export function CalculationPage() {
  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <CartSummary />
    </Space>
  );
}
