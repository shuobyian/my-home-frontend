import { css } from "@emotion/react";

// 아래 탭 막대의 높이(아이폰 하단 안전 영역 제외). 본문이 가려지지 않도록 AppLayout이 같은 만큼 아래 여백을 둔다.
export const NAV_BAR_HEIGHT = "56px";

// 화면 너비에 따른 모양(인스타그램처럼 아이콘 중심)
// - 768px 미만: 화면 아래에 붙는 탭 막대. 아이콘만 보이고, 칸이 너무 좁아지는 기기(약 370px 미만)에서는 옆으로 민다.
// - 768px 이상: 왼쪽 세로 줄. 아이콘만 보인다.
// - 1024px 이상: 왼쪽 사이드바. 아이콘과 이름이 함께 보인다.
// 이름은 화면에서만 숨겨 스크린 리더에는 항상 읽힌다.
export const styles = {
  nav: css`
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    height: calc(${NAV_BAR_HEIGHT} + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    overflow-x: auto;
    background: var(--ui-color-bg-container);
    border-top: 1px solid var(--ui-color-border-secondary);
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 768px) {
      position: sticky;
      top: 0;
      right: auto;
      bottom: auto;
      left: auto;
      flex: none;
      align-self: flex-start;
      width: 72px;
      height: 100vh;
      height: 100dvh;
      padding: var(--ui-space-3) var(--ui-space-2);
      overflow: hidden auto;
      border-top: 0;
      border-right: 1px solid var(--ui-color-border-secondary);
    }

    @media (min-width: 1024px) {
      width: 240px;
    }
  `,

  list: css`
    display: flex;
    flex: 1 0 auto;
    margin: 0;
    padding: 0;
    list-style: none;

    @media (min-width: 768px) {
      flex-direction: column;
      gap: var(--ui-space-1);
    }
  `,

  // 탭 막대에서는 칸이 너비를 나눠 갖고(터치 최소 크기 44px. 관리자 메뉴까지 7칸이 375px에 들어간다),
  // 세로 줄에서는 높이만큼만 차지한다
  entry: css`
    display: flex;
    flex: 1 0 44px;

    @media (min-width: 768px) {
      flex: none;
    }
  `,

  // 링크와 버튼(로그인·로그아웃)이 같은 모양을 쓴다.
  // 현재 화면은 aria-current="page"로 표시한다. :hover 규칙은 전역 a:hover보다 앞서도록 클래스 안에 둔다.
  item: css`
    position: relative;
    display: flex;
    flex: 1;
    gap: var(--ui-space-4);
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0;
    font: inherit;
    color: var(--ui-color-text);
    cursor: pointer;
    background: transparent;
    border: 0;
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

    @media (min-width: 768px) {
      height: 48px;
      border-radius: var(--ui-radius-lg);
    }

    @media (min-width: 1024px) {
      justify-content: flex-start;
      padding: 0 var(--ui-space-3);
      font-size: 16px;
    }
  `,

  icon: css`
    display: inline-flex;
    flex: none;
    font-size: 24px;
  `,

  label: css`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;

    @media (min-width: 1024px) {
      position: static;
      width: auto;
      height: auto;
      margin: 0;
      overflow: visible;
      clip: auto;
    }
  `,

  // 메뉴 묶음 사이의 구분선. 탭 막대에서는 세로선, 세로 줄에서는 가로선이다
  divider: css`
    flex: none;
    width: 1px;
    margin: var(--ui-space-3) var(--ui-space-1);
    background: var(--ui-color-border-secondary);

    @media (min-width: 768px) {
      width: auto;
      height: 1px;
      margin: var(--ui-space-2) var(--ui-space-3);
    }
  `,

  // 이 구분선부터 아래(계정)를 세로 줄의 맨 아래로 민다
  pushDown: css`
    @media (min-width: 768px) {
      margin-top: auto;
    }
  `,

  // 사이드바에서만 보이는 글자
  wideOnly: css`
    display: none;
    padding: 0 var(--ui-space-3);
    overflow: hidden;
    font-size: var(--ui-font-size-sm);
    color: var(--ui-color-text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (min-width: 1024px) {
      display: block;
    }
  `,
};
