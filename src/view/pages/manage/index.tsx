import { Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import RawProductTable from "view/components/manage/RawProductTable";

export function Manage() {
  const navigate = useNavigate();

  return (
    <Space direction='vertical' style={{ gap: "30px" }}>
      <Space>
        <Button onClick={() => navigate("product")}>물품 리스트</Button>
        <Button onClick={() => navigate("market")}>시세 리스트</Button>
      </Space>
      <RawProductTable />
    </Space>
  );
}
