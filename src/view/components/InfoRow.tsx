import { Space, Typography } from "antd";

export function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <Space style={{ gap: "10px" }}>
      <Typography.Text strong style={{ minWidth: "110px" }}>
        {title}
      </Typography.Text>
      <Typography.Text style={{ flexGrow: 1 }}>{value}</Typography.Text>
    </Space>
  );
}
