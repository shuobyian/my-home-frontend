import { ROUTES } from "@/app/routes";
import { Title } from "@/ui";
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

// 모든 화면 공통 헤더. 가운데의 제목을 누르면 홈으로 간다. 메뉴는 AppNav, 제작자는 AppLayout의 footer가 맡는다.
export function AppHeader() {
  return (
    <header style={{ marginBottom: "10px", textAlign: "center" }}>
      <Link to={ROUTES.HOME} css={homeLink}>
        <Title level={3} style={{ margin: 0 }}>
          놀러와 마이홈 제작 계산기
        </Title>
      </Link>
    </header>
  );
}
