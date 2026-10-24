import { ROUTES } from "@/app/routes";
import { Stack, Text, Title } from "@/ui";
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

// 모든 화면 공통 헤더. 제목을 누르면 홈으로 간다. 메뉴는 AppNav가 맡는다.
export function AppHeader() {
  return (
    <header style={{ marginBottom: "10px" }}>
      <Stack vertical gap={0}>
        <Link to={ROUTES.HOME} css={homeLink}>
          <Title level={3} style={{ margin: 0 }}>
            놀러와 마이홈 제작 계산기
          </Title>
        </Link>
        <Text tone='secondary'>제작자: 늘흰</Text>
      </Stack>
    </header>
  );
}
