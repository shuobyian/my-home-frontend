import { css, keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
`;

const zoomIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
`;

export const styles = {
  mask: css`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: var(--ui-z-overlay);
    background: var(--ui-color-mask);
    animation: ${fadeIn} var(--ui-motion);
  `,

  // 열릴 때 포커스를 받는 틀일 뿐이라 외곽선을 그리지 않는다
  panel: css`
    background: var(--ui-color-bg-container);
    box-shadow: var(--ui-shadow-lg);

    &:focus {
      outline: none;
    }
  `,

  title: css`
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: var(--ui-font-size-lg);
    font-weight: var(--ui-font-weight-semibold);
    line-height: var(--ui-line-height-heading);
    overflow-wrap: break-word;
  `,

  close: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: var(--ui-control-height);
    height: var(--ui-control-height);
    padding: 0;
    font-size: var(--ui-icon-size-sm);
    color: var(--ui-color-text-secondary);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: var(--ui-radius-sm);
    transition:
      color var(--ui-motion),
      background-color var(--ui-motion);

    &:hover:not(:disabled) {
      color: var(--ui-color-text);
      background: var(--ui-color-bg-hover);
    }

    &:disabled {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
    }
  `,

  // Modal: 위쪽 여유를 두고 가운데에 놓는다. 내용이 길면 마스크가 스크롤한다
  modalMask: css`
    padding: var(--ui-space-9) 0 var(--ui-space-5);
    overflow: auto;

    @media (max-width: 767px) {
      padding-top: var(--ui-space-4);
    }
  `,

  modal: css`
    max-width: calc(100vw - var(--ui-space-6));
    margin: 0 auto;
    padding: var(--ui-space-5);
    border-radius: var(--ui-radius-xl);
    animation: ${zoomIn} var(--ui-motion);
  `,

  modalHeader: css`
    display: flex;
    gap: var(--ui-space-2);
    align-items: center;
    margin-bottom: var(--ui-space-4);
  `,

  modalFooter: css`
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-space-2);
    justify-content: flex-end;
    margin-top: var(--ui-space-5);
  `,

  // Drawer: 오른쪽 전체 높이
  drawer: css`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    max-width: 100vw;
    animation: ${slideIn} var(--ui-motion);
  `,

  drawerHeader: css`
    display: flex;
    flex: none;
    gap: var(--ui-space-3);
    align-items: center;
    padding: var(--ui-space-4) var(--ui-space-5);
    border-bottom: var(--ui-border-width) solid var(--ui-color-border-secondary);
  `,

  drawerBody: css`
    flex: 1;
    min-height: 0;
    padding: var(--ui-space-5);
    overflow: auto;
  `,
};
