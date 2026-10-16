import { Space, Typography } from "antd";
import { Result } from "view/components/home/Result";

export function Home() {
  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Space direction='vertical' size={0}>
        <Typography.Text>
          물품 이름을 입력해주세요. 기초 재료를 확인하실 수 있습니다.
        </Typography.Text>
        <Typography.Text>
          빈칸 입력 시 모든 물품 확인이 가능합니다.
        </Typography.Text>
      </Space>
      <Result />
    </Space>
  );
}
