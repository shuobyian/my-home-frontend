import { Button, Space, Typography } from "antd";
import { ROUTES } from "app/routes";
import { Link, useNavigate } from "react-router-dom";

// 모든 화면 공통 헤더. 제목을 누르면 홈으로 간다.
export function AppHeader() {
  const navigate = useNavigate();

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "10px",
      }}
    >
      <Space direction='vertical' size={0}>
        <Link to={ROUTES.HOME}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            놀러와 마이홈 제작 계산기
          </Typography.Title>
        </Link>
        <Typography.Text type='secondary'>제작자: 늘흰</Typography.Text>
      </Space>
      <Space>
        <Button onClick={() => navigate(ROUTES.WALNUT)}>호두작</Button>
        <Button onClick={() => navigate(ROUTES.FREE)}>자유 모드</Button>
      </Space>
    </header>
  );
}
