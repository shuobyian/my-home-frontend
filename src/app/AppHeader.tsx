import { ROUTES } from "@/app/routes";
import { useNavigateTo } from "@/app/useNavigateTo";
import { CartButton } from "@/components/cart/CartButton";
import { Button, Stack, Text, Title } from "@/ui";
import { css } from "@emotion/react";
import { Link } from "react-router";

const homeLink = css`
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    border-radius: var(--ui-radius-sm);
  }

  &:hover h3 {
    color: var(--ui-color-primary);
  }
`;

// 모든 화면 공통 헤더. 제목을 누르면 홈으로 간다.
export function AppHeader() {
  const navigateTo = useNavigateTo();

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
      <Stack vertical gap={0}>
        <Link to={ROUTES.HOME} css={homeLink}>
          <Title level={3} style={{ margin: 0 }}>
            놀러와 마이홈 제작 계산기
          </Title>
        </Link>
        <Text tone='secondary'>제작자: 늘흰</Text>
      </Stack>
      <Stack>
        <Button onClick={() => navigateTo(ROUTES.WALNUT)}>호두작</Button>
        <Button onClick={() => navigateTo(ROUTES.FREE)}>자유 모드</Button>
        <CartButton />
      </Stack>
    </header>
  );
}
