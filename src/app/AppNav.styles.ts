import { css } from "@emotion/react";
import { breakpoints } from "@/ui";

// 메뉴 높이·안전 여백은 본문과 스크롤 버튼에서도 같은 토큰을 쓴다.
const BAR_HEIGHT = "var(--ui-nav-height)";
export const NAV_BAR_SPACE = "var(--ui-nav-space)";
export const ADMIN_NAV_SPACE = "var(--ui-nav-admin-space)";

// 화면에서만 숨긴다. 스크린 리더에는 그대로 읽힌다
const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// 막대 겉모양(메뉴 막대, 관리자 메뉴 버튼). 뒤 내용이 살짝 비치도록 반투명 배경을 흐리게 깐다
const surface = css`
  background: var(--ui-nav-bg);
  backdrop-filter: blur(var(--ui-nav-blur));
  border: var(--ui-border-width) solid var(--ui-color-border-secondary);
  box-shadow: var(--ui-shadow-md);
`;

// 둥근 메뉴 막대. 스크롤해도 같은 자리에 있다.
// - 768px 미만: 화면 아래 가운데에 뜬다. 아이콘만 보이고, 칸이 모자라면 막대 안에서 옆으로 민다.
//   관리자는 오른쪽 아래에 관리자 메뉴 버튼이 서므로 그 왼쪽 자리의 가운데에 선다.
// - 768px 이상: 화면 위 가운데에 붙는다. 아이콘만 보인다.
// - 1024px 이상: 아이콘과 이름이 함께 보인다. 로그아웃은 늘 아이콘만 보인다.
// 관리자 메뉴(adminNav)는 768px 미만에서는 버튼을 눌러 위로 여는 메뉴, 이상에서는 오른쪽 가운데의 세로 막대다.
// 이름은 화면에서만 숨겨 스크린 리더에는 항상 읽히고, 아이콘만 보일 때는 title로 알려 준다.
export const styles = {
  // 768px 미만은 좌우 10px 안에서 내용 너비만큼 가운데에 선다.
  // fit-content는 내용의 최소 너비보다 줄지 않으므로 max-width로 자리 안에 묶는다(넘치면 막대 안에서 민다)
  nav: css`
    position: fixed;
    right: var(--ui-nav-offset);
    bottom: calc(env(safe-area-inset-bottom) + var(--ui-nav-offset));
    left: var(--ui-nav-offset);
    z-index: var(--ui-z-nav);
    display: flex;
    width: fit-content;
    max-width: calc(100% - 2 * var(--ui-nav-offset));
    margin: 0 auto;

    @media (min-width: ${breakpoints.tablet}) {
      position: sticky;
      top: 0;
      right: auto;
      bottom: auto;
      left: auto;
      justify-content: center;
      width: auto;
      max-width: none;
      margin: 0;
      padding: var(--ui-space-4) var(--ui-page-gutter) var(--ui-space-2);
    }
  `,

  // 768px 미만: 관리자 메뉴 버튼(오른쪽 10px + 너비 54px)과 10px 띄운다
  navBesideAdmin: css`
    right: calc(${BAR_HEIGHT} + 2 * var(--ui-nav-offset));
    max-width: calc(100% - ${BAR_HEIGHT} - 3 * var(--ui-nav-offset));
  `,

  list: css`
    ${surface}
    display: flex;
    gap: var(--ui-space-1);
    align-items: center;
    max-width: 100%;
    margin: 0;
    padding: var(--ui-nav-padding);
    overflow-x: auto;
    list-style: none;
    border-radius: var(--ui-radius-full);
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `,

  entry: css`
    display: flex;
    flex: none;
  `,

  // 링크와 버튼(로그인·로그아웃)이 같은 모양을 쓴다. 아이콘만 보이는 1024px 미만은 40px 원이다.
  // 현재 화면은 aria-current="page"로 표시한다. :hover 규칙은 전역 a:hover보다 앞서도록 클래스 안에 둔다.
  item: css`
    position: relative;
    display: flex;
    gap: var(--ui-space-2);
    align-items: center;
    justify-content: center;
    min-width: var(--ui-nav-item-size);
    height: var(--ui-nav-item-size);
    padding: 0;
    font: inherit;
    color: var(--ui-color-text-secondary);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ui-radius-full);
    transition:
      color var(--ui-motion),
      background-color var(--ui-motion);

    &:hover {
      color: var(--ui-color-text);
      background: var(--ui-color-bg-hover);
    }

    &:focus-visible {
      outline-offset: -2px;
    }

    &[aria-busy="true"] {
      cursor: progress;
      opacity: var(--ui-opacity-busy);
    }

    &[aria-current="page"] {
      font-weight: var(--ui-font-weight-semibold);
      color: var(--ui-color-primary);
      background: var(--ui-color-primary-bg);
    }

    @media (min-width: ${breakpoints.desktop}) {
      padding: 0 var(--ui-space-3);
    }
  `,

  icon: css`
    display: inline-flex;
    flex: none;
    font-size: var(--ui-icon-size);
  `,

  // 1024px 이상에서만 보이는 이름. 긴 닉네임은 말줄임한다
  label: css`
    ${visuallyHidden}

    @media (min-width: ${breakpoints.desktop}) {
      position: static;
      width: auto;
      max-width: 10em;
      height: auto;
      margin: 0;
      text-overflow: ellipsis;
      clip: auto;
    }
  `,

  // 늘 화면에서 숨기는 이름(로그아웃, 관리자 메뉴 버튼)
  hiddenLabel: visuallyHidden,

  // 메뉴 묶음 사이의 세로 구분선
  divider: css`
    flex: none;
    width: 1px;
    height: var(--ui-icon-size);
    margin: 0 var(--ui-space-1);
    background: var(--ui-color-border);
  `,

  // 관리자 메뉴의 자리. 스크롤해도 따라온다.
  // - 768px 미만: 오른쪽 아래(주 메뉴 막대 옆)의 버튼이고, 메뉴는 그 위로 열린다. 열린 메뉴는 '맨 위로' 버튼을 덮는다.
  // - 768px 이상: 오른쪽 세로 가운데의 막대. 본문이 가리지 않도록 AppLayout이 ADMIN_NAV_SPACE만큼 오른쪽 여백을 둔다.
  adminNav: css`
    position: fixed;
    right: var(--ui-nav-offset);
    bottom: calc(env(safe-area-inset-bottom) + var(--ui-nav-offset));
    z-index: var(--ui-z-nav-admin);
    display: flex;
    flex-direction: column-reverse;
    gap: var(--ui-space-2);
    align-items: flex-end;

    @media (min-width: ${breakpoints.tablet}) {
      top: 50%;
      right: var(--ui-nav-offset);
      bottom: auto;
      transform: translateY(-50%);
    }
  `,

  // 관리자 메뉴를 여닫는 둥근 버튼(768px 미만에서만 보인다)
  adminToggle: css`
    ${surface}
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${BAR_HEIGHT};
    height: ${BAR_HEIGHT};
    padding: 0;
    font: inherit;
    color: var(--ui-color-text-secondary);
    cursor: pointer;
    border-radius: 50%;

    &[aria-expanded="true"] {
      color: var(--ui-color-primary);
    }

    @media (min-width: ${breakpoints.tablet}) {
      display: none;
    }
  `,

  // 막대 모양(list)을 세로로 쌓는다. 768px 미만에서는 열었을 때만 보이고, 이름도 함께 보여 왼쪽에 맞춘다
  adminList: css`
    flex-direction: column;
    align-items: stretch;
    overflow: visible;
    border-radius: calc(var(--ui-nav-height) / 2);

    &:not([data-open]) {
      display: none;
    }

    & a {
      flex: 1;
      justify-content: flex-start;
      padding: 0 var(--ui-space-3);
    }

    @media (min-width: ${breakpoints.tablet}) {
      &:not([data-open]) {
        display: flex;
      }
    }
  `,

  // 관리자 메뉴의 이름. 768px 미만(열린 메뉴)에서만 보인다
  adminLabel: css`
    @media (min-width: ${breakpoints.tablet}) {
      ${visuallyHidden}
    }
  `,
};
