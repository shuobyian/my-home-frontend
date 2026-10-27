import { css } from "@emotion/react";

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

// 화면 위 가운데에 떠 있는 둥근 메뉴 막대. 스크롤해도 위에 붙어 있다.
// - 1024px 미만: 아이콘만 보인다. 칸이 모자라면(좁은 화면의 관리자) 막대 안에서 옆으로 민다.
// - 1024px 이상: 아이콘과 이름이 함께 보인다. 관리자 메뉴와 로그아웃은 자리가 모자라 늘 아이콘만 보인다.
// 이름은 화면에서만 숨겨 스크린 리더에는 항상 읽히고, 아이콘만 보일 때는 title로 알려 준다.
export const styles = {
  nav: css`
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: center;
    padding: var(--ui-space-3) 10px var(--ui-space-2);
  `,

  // 막대. 뒤 내용이 살짝 비치도록 반투명 배경을 흐리게 깐다
  list: css`
    display: flex;
    gap: var(--ui-space-1);
    align-items: center;
    max-width: 100%;
    margin: 0;
    padding: 6px;
    overflow-x: auto;
    list-style: none;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    border: 1px solid var(--ui-color-border-secondary);
    border-radius: 999px;
    box-shadow: var(--ui-shadow);
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `,

  entry: css`
    display: flex;
    flex: none;
  `,

  // 링크와 버튼(로그인·로그아웃)이 같은 모양을 쓴다.
  // 현재 화면은 aria-current="page"로 표시한다. :hover 규칙은 전역 a:hover보다 앞서도록 클래스 안에 둔다.
  item: css`
    position: relative;
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 var(--ui-space-3);
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

  // 늘 화면에서 숨기는 이름(관리자 메뉴·로그아웃)
  hiddenLabel: visuallyHidden,

  // 메뉴 묶음 사이의 세로 구분선
  divider: css`
    flex: none;
    width: 1px;
    height: 20px;
    margin: 0 var(--ui-space-1);
    background: var(--ui-color-border);
  `,

  // 1024px 이상에서만 보이는 묶음 이름(관리자)
  wideOnly: css`
    display: none;
    padding: 0 var(--ui-space-1);
    font-size: var(--ui-font-size-sm);
    color: var(--ui-color-text-secondary);
    white-space: nowrap;

    @media (min-width: 1024px) {
      display: block;
    }
  `,
};
