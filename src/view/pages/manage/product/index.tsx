import { Space } from "antd";
import ProductTable from "view/components/manage/ProductTable";

export function Product() {
  return (
    <Space direction='vertical' style={{ gap: "30px" }}>
      <ProductTable />
    </Space>
  );
}
