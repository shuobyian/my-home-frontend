import { styles } from "@/app/AppNav.styles";
import { ADMIN_MENU, MEMBER_MENU, MenuItem, USER_MENU } from "@/app/menus";
import { ROUTES } from "@/app/routes";
import { Avatar } from "@/components/common/Avatar";
import { useLogoutMutation } from "@/queries/auth";
import { useCurrentUser } from "@/state/auth";
import { LoginIcon, LogoutIcon } from "@/ui";
import { ReactNode } from "react";
import {
  createPath,
  Link,
  matchPath,
  useLocation,
  useNavigate,
} from "react-router";

interface ItemContentProps {
  icon: ReactNode;
  label: string;
  // 넓은 화면에서도 이름을 눈에 보이지 않게 한다
  iconOnly?: boolean;
}

// 아이콘과 이름. 이름은 좁은 화면(iconOnly면 언제나)에서 눈에만 보이지 않는다.
function ItemContent({ icon, label, iconOnly }: ItemContentProps) {
  return (
    <>
      <span css={styles.icon}>{icon}</span>
      <span css={iconOnly ? styles.hiddenLabel : styles.label}>{label}</span>
    </>
  );
}

function MenuLink({ item, iconOnly }: { item: MenuItem; iconOnly?: boolean }) {
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
        <ItemContent icon={item.icon} label={item.label} iconOnly={iconOnly} />
      </Link>
    </li>
  );
}

// 모든 화면 공통 메뉴. 화면 위 가운데에 떠 있는 둥근 막대다(모양은 AppNav.styles).
// 누구나 쓰는 메뉴(USER_MENU)와 계정(프로필·로그인·로그아웃)을 구분선으로 나눈다.
// 로그인한 회원의 메뉴(MEMBER_MENU)는 누구나 쓰는 메뉴에 이어 붙인다.
// 관리자에게만 보이는 메뉴(ADMIN_MENU)는 오른쪽 가운데에 따로 떠 있는 세로 막대로, 스크롤해도 따라온다.
export function AppNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const logout = useLogoutMutation();
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
          {user &&
            MEMBER_MENU.map((item) => <MenuLink key={item.to} item={item} />)}

          <li aria-hidden='true' css={styles.divider} />
          {user ? (
            <>
              {/* 로그인한 회원은 게임 닉네임으로 보여 주고, 누르면 프로필(닉네임 수정)로 간다 */}
              <MenuLink
                item={{
                  label: user.nickname,
                  to: ROUTES.PROFILE,
                  icon: <Avatar name={user.nickname} size={24} />,
                }}
              />
              <li css={styles.entry}>
                <button
                  type='button'
                  aria-busy={logout.isPending || undefined}
                  title={`${user.nickname} 로그아웃`}
                  css={styles.item}
                  onClick={() => {
                    if (!logout.isPending) logout.mutate();
                  }}
                >
                  <ItemContent
                    icon={<LogoutIcon />}
                    label='로그아웃'
                    iconOnly
                  />
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

      {user?.isAdmin && (
        <nav aria-label='관리자 메뉴' css={styles.adminNav}>
          <ul css={[styles.list, styles.adminList]}>
            {ADMIN_MENU.map((item) => (
              <MenuLink key={item.to} item={item} iconOnly />
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}
