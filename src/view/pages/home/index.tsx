import { Space } from "antd";
import { Header } from "view/components/Header";
import { Result } from "view/components/home/Result";

export function Home() {
  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Header />
      <Result />
    </Space>
  );
}
