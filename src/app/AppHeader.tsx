import { Button, Space, theme, Typography } from "antd";
import { ROUTES } from "@/app/routes";
import { CartButton } from "@/components/cart/CartButton";
import { CSSProperties } from "react";
import { Link, useNavigate } from "react-router";

// 모든 화면 공통 헤더. 제목을 누르면 홈으로 간다.
export function AppHeader() {
  const navigate = useNavigate();
  const { token } = theme.useToken();

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
        <Link
          to={ROUTES.HOME}
          className='app-home-link'
          // 포커스·마우스 오버 색(index.css)을 테마 대표색과 맞춘다
          style={{ "--app-brand-color": token.colorPrimary } as CSSProperties}
        >
          <Typography.Title level={3} style={{ margin: 0 }}>
            놀러와 마이홈 제작 계산기
          </Typography.Title>
        </Link>
        <Typography.Text type='secondary'>제작자: 늘흰</Typography.Text>
      </Space>
      <Space>
        <Button onClick={() => navigate(ROUTES.WALNUT)}>호두작</Button>
        <Button onClick={() => navigate(ROUTES.FREE)}>자유 모드</Button>
        <CartButton />
      </Space>
    </header>
  );
}
