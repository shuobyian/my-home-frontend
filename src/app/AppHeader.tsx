import { ROUTES } from "@/app/routes";
import { useNavigateTo } from "@/app/useNavigateTo";
import { CartButton } from "@/components/cart/CartButton";
import { useLogoutMutation } from "@/queries/auth";
import { useCurrentUser } from "@/state/auth";
import { Button, Stack, Text, Title } from "@/ui";
import { css } from "@emotion/react";
import {
  createPath,
  Link,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router";

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
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const logout = useLogoutMutation();
  // 로그인·회원가입 화면에서는 로그인 버튼을 감춘다(그 화면이 곧 로그인 폼)
  const onAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].some((path) =>
    matchPath(path, location.pathname)
  );

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
      <Stack wrap>
        <Button onClick={() => navigateTo(ROUTES.WALNUT)}>호두작</Button>
        <Button onClick={() => navigateTo(ROUTES.FREE)}>자유 모드</Button>
        <CartButton />
        {user ? (
          <>
            <Text>{user.username}</Text>
            <Button loading={logout.isPending} onClick={() => logout.mutate()}>
              로그아웃
            </Button>
          </>
        ) : (
          !onAuthPage && (
            // 로그인하면 지금 화면으로 돌아온다(화면의 state도 함께. 예: 자유 모드 결과).
            // ponytail: 히스토리에는 지금 화면이 한 번 더 쌓인다(로그인 화면 자리를 지금 화면으로 바꾸므로).
            // 뒤로 가기 한 번이 헛도는 게 문제가 되면 로그인 뒤 navigate(-1)로 돌아가게 바꾼다.
            <Button
              onClick={() =>
                navigate(ROUTES.LOGIN, {
                  state: {
                    from: createPath(location),
                    fromState: location.state,
                  },
                })
              }
            >
              로그인
            </Button>
          )
        )}
      </Stack>
    </header>
  );
}
