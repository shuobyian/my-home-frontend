import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";
import { CloseIcon } from "./icons";
import styles from "./Overlay.module.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// 여러 겹이 열려도 body 스크롤은 한 번만 잠그고, 마지막 겹이 닫힐 때 푼다
let lockCount = 0;
// 열린 겹의 패널(나중에 열린 것이 뒤). Esc·Tab은 맨 위 겹만 처리한다.
const layers: HTMLElement[] = [];

function lockScroll() {
  const { style } = document.body;
  if (lockCount++ === 0) {
    // 스크롤바가 사라지며 화면이 밀리지 않게 그 폭만큼 채운다
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    style.overflow = "hidden";
    style.paddingRight = `${scrollbarWidth}px`;
  }
  return () => {
    if (--lockCount === 0) {
      style.overflow = "";
      style.paddingRight = "";
    }
  };
}

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  // 대화상자 이름이 되는 제목 요소의 id
  labelledBy: string;
  // false면 Esc·바깥 클릭으로 닫히지 않는다
  dismissible?: boolean;
  width: number;
  maskClassName?: string;
  panelClassName: string;
  children: ReactNode;
}

// Modal·Drawer의 바탕: 마스크, 포커스 가두기·복원, 스크롤 잠금. 닫히면 언마운트한다.
export function Overlay({ open, ...props }: OverlayProps) {
  return open ? createPortal(<Layer {...props} />, document.body) : null;
}

function Layer({
  onClose,
  labelledBy,
  dismissible = true,
  width,
  maskClassName,
  panelClassName,
  children,
}: Omit<OverlayProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pressedMaskRef = useRef(false);
  // 렌더 때 잡아야 autoFocus 자식이 포커스를 가져가기 전의 요소가 남는다
  const [returnFocus] = useState(() => document.activeElement);

  useLayoutEffect(lockScroll, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    layers.push(panel);
    if (!panel.contains(document.activeElement)) panel.focus();
    return () => {
      layers.splice(layers.indexOf(panel), 1);
      // StrictMode의 가짜 언마운트는 DOM이 남아 있으므로 포커스를 옮기지 않는다
      if (
        !panel.isConnected &&
        returnFocus instanceof HTMLElement &&
        returnFocus.isConnected
      ) {
        returnFocus.focus();
      }
    };
  }, [returnFocus]);

  // 포커스가 패널 밖(지워진 버튼 자리의 body 등)에 있어도 동작하도록 document에서 받는다
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = layers[layers.length - 1];
      if (!panel || panel !== panelRef.current) return;
      if (event.key === "Escape") {
        if (dismissible) onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const active = document.activeElement;
      const outside = !panel.contains(active);
      const wrapTo = event.shiftKey
        ? (outside || active === first || active === panel) && last
        : (outside || active === last) && first;
      if (wrapTo) {
        event.preventDefault();
        wrapTo.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dismissible, onClose]);

  return (
    // 바깥 클릭은 마우스 편의 기능이다. 키보드는 Esc와 닫기 버튼으로 닫는다.
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions
    <div
      className={cx(styles.mask, maskClassName)}
      onMouseDown={(event) => {
        // 대화상자 안에서 누르고 밖에서 놓은 경우는 바깥 클릭으로 보지 않는다
        pressedMaskRef.current = event.target === event.currentTarget;
        // 마스크를 눌러도 포커스가 대화상자 밖으로 빠지지 않게 한다
        if (pressedMaskRef.current) event.preventDefault();
      }}
      onClick={(event) => {
        if (
          dismissible &&
          pressedMaskRef.current &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
        pressedMaskRef.current = false;
      }}
    >
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cx(styles.panel, panelClassName)}
        style={{ width }}
      >
        {children}
      </div>
    </div>
  );
}

export function CloseButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type='button'
      className={styles.close}
      aria-label='닫기'
      disabled={disabled}
      onClick={onClick}
    >
      <CloseIcon />
    </button>
  );
}
