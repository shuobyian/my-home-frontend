import { Space } from "antd";
import { CalculationList } from "view/components/calculation/CalculationList";

export function Calculation() {
  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <CalculationList />
    </Space>
  );
}
