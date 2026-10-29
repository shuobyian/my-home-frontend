import { ROUTES } from "@/app/routes";
import { HomeIcon, Title } from "@/ui";
import { Link } from "react-router";
import { styles } from "./AppHeader.styles";

// 모든 화면 공통 헤더. 로고와 제목을 누르면 홈으로 간다. 메뉴는 AppNav가 맡는다.
export function AppHeader() {
  return (
    <header css={styles.header}>
      <Link
        to={ROUTES.HOME}
        css={styles.homeLink}
        aria-label='놀러와 마이홈 제작 계산기'
      >
        <span css={styles.mark} aria-hidden='true'>
          <HomeIcon />
        </span>
        <div>
          <span css={styles.eyebrow}>놀러와 마이홈</span>
          <Title level={1} css={styles.title}>
            제작 계산기
          </Title>
        </div>
      </Link>
      <p css={styles.description}>필요한 재료부터 제작 비용까지 한눈에.</p>
    </header>
  );
}
