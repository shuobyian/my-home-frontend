import { styles } from "@/app/AppNav.styles";
import { ADMIN_MENU, MenuItem, USER_MENU } from "@/app/menus";
import { ROUTES } from "@/app/routes";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useLogoutMutation } from "@/queries/auth";
import { useCurrentUser } from "@/state/auth";
import { useCart } from "@/state/cart";
import { CartIcon, LoginIcon, LogoutIcon } from "@/ui";
import { ReactNode, useState } from "react";
import {
  createPath,
  Link,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router";

// 아이콘과 이름. 이름은 좁은 화면에서 눈에만 보이지 않는다.
function ItemContent({
  icon,
  label,
  badge,
}: {
  icon: ReactNode;
  label: string;
  badge?: ReactNode;
}) {
  return (
    <>
      <span css={styles.icon}>
        {icon}
        {badge}
      </span>
      <span css={styles.label}>{label}</span>
    </>
  );
}

function MenuLink({ item }: { item: MenuItem }) {
  const { pathname } = useLocation();
  // 라우터와 같은 규칙(끝 슬래시 허용, 대소문자 무시)으로 현재 메뉴인지 본다.
  // NavLink는 /manage/를 /manage와 같은 주소로 보지 않아 쓰지 않는다.
  const current =
    matchPath({ path: item.to, end: item.end ?? false }, pathname) !== null;

  return (
    <li css={styles.entry}>
      <Link
        to={item.to}
        aria-current={current ? "page" : undefined}
        // 아이콘만 보이는 너비에서 이름을 알려 준다
        title={item.label}
        css={styles.item}
      >
        <ItemContent icon={item.icon} label={item.label} />
      </Link>
    </li>
  );
}

// 모든 화면 공통 메뉴. 인스타그램처럼 아이콘 중심이다: 넓은 화면은 왼쪽 사이드바(아이콘+이름),
// 중간은 왼쪽 아이콘 줄, 좁은 화면은 아래 탭 막대.
// 누구나 쓰는 메뉴(USER_MENU)와 관리자에게만 보이는 메뉴(ADMIN_MENU)를 구분선으로 나눈다.
export function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const logout = useLogoutMutation();
  const { totalCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  // 로그인·회원가입 화면에서는 로그인 메뉴를 감춘다(그 화면이 곧 로그인 폼)
  const onAuthPage = [ROUTES.LOGIN, ROUTES.SIGNUP].some((path) =>
    matchPath(path, location.pathname)
  );

  return (
    <>
      <nav aria-label='주 메뉴' css={styles.nav}>
        <ul css={styles.list}>
          {USER_MENU.map((item) => (
            <MenuLink key={item.to} item={item} />
          ))}
          <li css={styles.entry}>
            <button
              type='button'
              aria-haspopup='dialog'
              // 수량 표시는 숫자만 보이므로 접근 이름에는 "개"를 붙여 알린다
              aria-label={
                totalCount > 0 ? `장바구니 ${totalCount}개` : undefined
              }
              title='장바구니'
              css={styles.item}
              onClick={() => setCartOpen(true)}
            >
              <ItemContent
                icon={<CartIcon />}
                label='장바구니'
                badge={
                  totalCount > 0 && (
                    <span aria-hidden='true' css={styles.badge}>
                      {totalCount > 99 ? "99+" : totalCount}
                    </span>
                  )
                }
              />
            </button>
          </li>

          {user?.isAdmin && (
            <>
              <li aria-hidden='true' css={styles.divider} />
              <li css={styles.wideOnly}>관리자</li>
              {ADMIN_MENU.map((item) => (
                <MenuLink key={item.to} item={item} />
              ))}
            </>
          )}

          <li aria-hidden='true' css={[styles.divider, styles.pushDown]} />
          {user ? (
            <>
              <li css={styles.wideOnly}>{user.username}</li>
              <li css={styles.entry}>
                <button
                  type='button'
                  aria-busy={logout.isPending || undefined}
                  title={`${user.username} 로그아웃`}
                  css={styles.item}
                  onClick={() => {
                    if (!logout.isPending) logout.mutate();
                  }}
                >
                  <ItemContent icon={<LogoutIcon />} label='로그아웃' />
                </button>
              </li>
            </>
          ) : (
            !onAuthPage && (
              <li css={styles.entry}>
                <button
                  type='button'
                  title='로그인'
                  css={styles.item}
                  // 로그인하면 지금 화면으로 돌아온다(화면의 state도 함께. 예: 자유 모드 결과).
                  // ponytail: 히스토리에는 지금 화면이 한 번 더 쌓인다(로그인 화면 자리를 지금 화면으로 바꾸므로).
                  // 뒤로 가기 한 번이 헛도는 게 문제가 되면 로그인 뒤 navigate(-1)로 돌아가게 바꾼다.
                  onClick={() =>
                    navigate(ROUTES.LOGIN, {
                      state: {
                        from: createPath(location),
                        fromState: location.state,
                      },
                    })
                  }
                >
                  <ItemContent icon={<LoginIcon />} label='로그인' />
                </button>
              </li>
            )
          )}
        </ul>
      </nav>
      {/* 서랍은 메뉴 밖에 둔다(메뉴의 스크롤·쌓임 맥락에 갇히지 않게) */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
