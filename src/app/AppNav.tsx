import { styles } from "@/app/AppNav.styles";
import { ADMIN_MENU, MEMBER_MENU, MenuItem, USER_MENU } from "@/app/menus";
import { ROUTES } from "@/app/routes";
import { Avatar } from "@/components/common/Avatar";
import { useLogoutMutation } from "@/queries/auth";
import { useCurrentUser } from "@/state/auth";
import { CloseIcon, LoginIcon, LogoutIcon, WrenchIcon } from "@/ui";
import type { SerializedStyles } from "@emotion/react";
import { ReactNode, useEffect, useId, useRef, useState } from "react";
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
  // 이름이 보이는 너비. 기본은 1024px 이상(styles.label)
  labelCss?: SerializedStyles;
}

// 아이콘과 이름. 이름은 보이지 않는 너비에서도 스크린 리더에는 읽힌다.
function ItemContent({
  icon,
  label,
  labelCss = styles.label,
}: ItemContentProps) {
  return (
    <>
      <span css={styles.icon}>{icon}</span>
      <span css={labelCss}>{label}</span>
    </>
  );
}

interface MenuLinkProps {
  item: MenuItem;
  labelCss?: SerializedStyles;
  onClick?: () => void;
}

function MenuLink({ item, labelCss, onClick }: MenuLinkProps) {
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
        onClick={onClick}
      >
        <ItemContent icon={item.icon} label={item.label} labelCss={labelCss} />
      </Link>
    </li>
  );
}

// 관리자에게만 보이는 메뉴(ADMIN_MENU). 자리와 모양은 AppNav.styles의 adminNav.
// 768px 미만에서는 버튼으로 연다. 메뉴를 고르거나, 바깥을 누르거나, Esc를 누르면 닫힌다.
// 768px 이상에서는 버튼이 숨고 메뉴가 늘 보인다.
function AdminNav() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && navRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <nav ref={navRef} aria-label='관리자 메뉴' css={styles.adminNav}>
      <button
        ref={toggleRef}
        type='button'
        aria-expanded={open}
        aria-controls={listId}
        title='관리자 메뉴'
        css={styles.adminToggle}
        onClick={() => setOpen(!open)}
      >
        <ItemContent
          icon={open ? <CloseIcon /> : <WrenchIcon />}
          label='관리자 메뉴'
          labelCss={styles.hiddenLabel}
        />
      </button>
      <ul
        id={listId}
        data-open={open || undefined}
        css={[styles.list, styles.adminList]}
      >
        {ADMIN_MENU.map((item) => (
          <MenuLink
            key={item.to}
            item={item}
            labelCss={styles.adminLabel}
            onClick={() => setOpen(false)}
          />
        ))}
      </ul>
    </nav>
  );
}

// 모든 화면 공통 메뉴. 둥근 막대로, 768px 미만은 화면 아래, 이상은 위 가운데에 뜬다(모양은 AppNav.styles).
// 누구나 쓰는 메뉴(USER_MENU)와 계정(프로필·로그인·로그아웃)을 구분선으로 나눈다.
// 로그인한 회원의 메뉴(MEMBER_MENU)는 누구나 쓰는 메뉴에 이어 붙인다.
// 관리자에게만 보이는 메뉴는 따로 떠 있는 AdminNav가 맡는다.
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
      <nav
        aria-label='주 메뉴'
        css={[styles.nav, user?.isAdmin && styles.navBesideAdmin]}
      >
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
                    labelCss={styles.hiddenLabel}
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

      {user?.isAdmin && <AdminNav />}
    </>
  );
}
