import { Space } from "antd";
import { ProductTable } from "components/product/ProductTable";

export function ProductManagePage() {
  return (
    <Space direction='vertical' style={{ gap: "30px" }}>
      <ProductTable />
    </Space>
  );
}
