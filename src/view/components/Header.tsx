import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "fixed", top: 0, padding: "10px", width: "100%" }}>
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
            justifyContent: "center",
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
          <Typography.Text strong>
            사진 제공: 루나응애 님, 떵히쭈 님
          </Typography.Text>
        </div>
        <Button
          onClick={() => navigate("free")}
          style={{ float: "right", margin: "10px" }}
        >
          자유 모드
        </Button>
      </div>
    </div>
  );
}
