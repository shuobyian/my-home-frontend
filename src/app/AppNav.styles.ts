import { css } from "@emotion/react";

// 768px 미만에서 화면 아래에 뜨는 메뉴 막대의 높이(버튼 40px + 안쪽 여백 6px×2 + 테두리 1px×2).
// 관리자 메뉴 버튼도 같은 크기라 막대와 나란히 선다.
const BAR_HEIGHT = "54px";

// 768px 미만에서 본문과 '맨 위로' 버튼이 아래 메뉴 막대(바닥에서 10px)에 가리지 않도록 비우는 아래 여백
export const NAV_BAR_SPACE = `calc(${BAR_HEIGHT} + 20px)`;

// 768px 이상에서 관리자 메뉴 막대(오른쪽 12px + 너비 56px)와 본문 사이를 띄우는 오른쪽 여백
export const ADMIN_NAV_SPACE = "76px";

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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--ui-color-border-secondary);
  box-shadow: var(--ui-shadow);
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
    right: 10px;
    bottom: calc(env(safe-area-inset-bottom) + 10px);
    left: 10px;
    z-index: 10;
    display: flex;
    width: fit-content;
    max-width: calc(100% - 20px);
    margin: 0 auto;

    @media (min-width: 768px) {
      position: sticky;
      top: 0;
      right: auto;
      bottom: auto;
      left: auto;
      justify-content: center;
      width: auto;
      max-width: none;
      margin: 0;
      padding: var(--ui-space-3) 10px var(--ui-space-2);
    }
  `,

  // 768px 미만: 관리자 메뉴 버튼(오른쪽 10px + 너비 54px)과 10px 띄운다
  navBesideAdmin: css`
    right: calc(${BAR_HEIGHT} + 20px);
    max-width: calc(100% - ${BAR_HEIGHT} - 30px);
  `,

  list: css`
    ${surface}
    display: flex;
    gap: var(--ui-space-1);
    align-items: center;
    max-width: 100%;
    margin: 0;
    padding: 6px;
    overflow-x: auto;
    list-style: none;
    border-radius: 999px;
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
    gap: 6px;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0;
    font: inherit;
    color: var(--ui-color-text-secondary);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 999px;
    transition:
      color var(--ui-motion),
      background-color var(--ui-motion);

    &:hover {
      color: var(--ui-color-text);
      background: var(--ui-color-bg-disabled);
    }

    &:focus-visible {
      outline-offset: -2px;
    }

    &[aria-busy="true"] {
      cursor: progress;
      opacity: 0.65;
    }

    &[aria-current="page"] {
      font-weight: 600;
      color: var(--ui-color-primary);
      background: var(--ui-color-primary-bg);
    }

    @media (min-width: 1024px) {
      padding: 0 var(--ui-space-3);
    }
  `,

  icon: css`
    display: inline-flex;
    flex: none;
    font-size: 18px;
  `,

  // 1024px 이상에서만 보이는 이름. 긴 닉네임은 말줄임한다
  label: css`
    ${visuallyHidden}

    @media (min-width: 1024px) {
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
    height: 20px;
    margin: 0 var(--ui-space-1);
    background: var(--ui-color-border);
  `,

  // 관리자 메뉴의 자리. 스크롤해도 따라온다.
  // - 768px 미만: 오른쪽 아래(주 메뉴 막대 옆)의 버튼이고, 메뉴는 그 위로 열린다. 열린 메뉴는 '맨 위로' 버튼을 덮는다.
  // - 768px 이상: 오른쪽 세로 가운데의 막대. 본문이 가리지 않도록 AppLayout이 ADMIN_NAV_SPACE만큼 오른쪽 여백을 둔다.
  adminNav: css`
    position: fixed;
    right: 10px;
    bottom: calc(env(safe-area-inset-bottom) + 10px);
    z-index: 11;
    display: flex;
    flex-direction: column-reverse;
    gap: var(--ui-space-2);
    align-items: flex-end;

    @media (min-width: 768px) {
      top: 50%;
      right: 12px;
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

    @media (min-width: 768px) {
      display: none;
    }
  `,

  // 막대 모양(list)을 세로로 쌓는다. 768px 미만에서는 열었을 때만 보이고, 이름도 함께 보여 왼쪽에 맞춘다
  adminList: css`
    flex-direction: column;
    align-items: stretch;
    overflow: visible;
    border-radius: 27px;

    &:not([data-open]) {
      display: none;
    }

    & a {
      flex: 1;
      justify-content: flex-start;
      padding: 0 var(--ui-space-3);
    }

    @media (min-width: 768px) {
      &:not([data-open]) {
        display: flex;
      }
    }
  `,

  // 관리자 메뉴의 이름. 768px 미만(열린 메뉴)에서만 보인다
  adminLabel: css`
    @media (min-width: 768px) {
      ${visuallyHidden}
    }
  `,
};
