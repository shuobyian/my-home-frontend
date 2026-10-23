import { ReactNode, useId } from "react";
import { CloseButton, Overlay } from "./Overlay";
import styles from "./Overlay.module.css";

interface DrawerProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  // 머리 오른쪽에 놓는 동작(예: 전체 삭제 버튼)
  extra?: ReactNode;
  width?: number;
}

// 오른쪽에서 나오는 서랍. 항상 Esc·바깥 클릭·닫기 버튼으로 닫힌다.
export function Drawer({
  open,
  title,
  onClose,
  children,
  extra,
  width = 378,
}: DrawerProps) {
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      width={width}
      panelClassName={styles.drawer}
    >
      <div className={styles.drawerHeader}>
        <CloseButton onClick={onClose} />
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {extra}
      </div>
      <div className={styles.drawerBody}>{children}</div>
    </Overlay>
  );
}
