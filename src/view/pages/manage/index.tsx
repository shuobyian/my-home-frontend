import { Button, Layout, Space, message } from "antd";
import { useResultMutation } from "queries/useResultMutation";
import { useNavigate } from "react-router-dom";
import ItemTable from "view/components/manage/ItemTable";

export function Manage() {
  const navigate = useNavigate();
  const { isLoading, mutate } = useResultMutation();

  return (
    <Layout>
      <Space style={{ padding: "5px", gap: "10px" }}>
        <Button onClick={() => navigate("market")}>시세 리스트</Button>
        <Button
          disabled={isLoading}
          onClick={() =>
            mutate(undefined, {
              onSuccess: () => {
                message.success("결과가 생성되었습니다.");
              },
            })
          }
        >
          결과 리스트 생성
        </Button>
      </Space>
      <ItemTable />
    </Layout>
  );
}
