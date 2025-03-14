import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "fixed", top: 0, width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography.Title level={3}>
            놀러와 마이홈 제작 계산기
          </Typography.Title>
          <Typography.Text>
            물품 이름과 수량을 입력해주세요. 기초 재료를 확인하실 수 있습니다.
          </Typography.Text>
          <Typography.Text>
            빈칸 입력 시 모든 물품 확인이 가능합니다.
          </Typography.Text>
          <Typography.Title level={5}>제작자: 늘흰</Typography.Title>
        </div>
        <div style={{ float: "right", margin: "10px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button onClick={() => navigate("walnut")}>호두작</Button>
            <Button onClick={() => navigate("free")}>자유 모드</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
