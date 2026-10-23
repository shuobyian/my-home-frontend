import { ReactNode, useId } from "react";
import { CloseButton, Overlay } from "./Overlay";
import styles from "./Overlay.module.css";

interface ModalProps {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  // 오른쪽 정렬로 놓는 버튼들
  footer?: ReactNode;
  width?: number;
  // false면 Esc·바깥 클릭·닫기 버튼으로 닫히지 않는다(저장 중 등)
  dismissible?: boolean;
}

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 520,
  dismissible = true,
}: ModalProps) {
  const titleId = useId();

  return (
    <Overlay
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      dismissible={dismissible}
      width={width}
      maskClassName={styles.modalMask}
      panelClassName={styles.modal}
    >
      <div className={styles.modalHeader}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <CloseButton onClick={onClose} disabled={!dismissible} />
      </div>
      {children}
      {footer != null && <div className={styles.modalFooter}>{footer}</div>}
    </Overlay>
  );
}
