import { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Feedback.module.css";
import { EmptyIcon, ErrorIcon, WarningIcon } from "./icons";

interface EmptyProps {
  description?: ReactNode;
  // 빈 상태에서 할 수 있는 동작(예: 물품 담으러 가기 버튼)
  children?: ReactNode;
}

export function Empty({ description = "데이터 없음", children }: EmptyProps) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyImage}>
        <EmptyIcon />
      </span>
      <div>{description}</div>
      {children}
    </div>
  );
}

interface ResultProps {
  status: "404" | "warning" | "error";
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}

// 화면 전체를 대신하는 안내(없는 주소, 화면 오류 등)
export function Result({ status, title, description, actions }: ResultProps) {
  return (
    <div className={styles.result}>
      <div
        className={cx(
          styles.resultIcon,
          status === "404" ? styles.notFound : styles[status]
        )}
        aria-hidden='true'
      >
        {status === "404" ? (
          "404"
        ) : status === "warning" ? (
          <WarningIcon />
        ) : (
          <ErrorIcon />
        )}
      </div>
      <h2 className={styles.resultTitle}>{title}</h2>
      {description && (
        <div className={styles.resultDescription}>{description}</div>
      )}
      {actions && <div className={styles.resultActions}>{actions}</div>}
    </div>
  );
}

interface AlertProps {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// 오류 안내 상자. 나타나면 스크린 리더가 바로 읽는다.
export function Alert({ title, description, className, style }: AlertProps) {
  return (
    <div
      role='alert'
      className={cx(
        styles.alert,
        description != null && styles.alertWithDescription,
        className
      )}
      style={style}
    >
      <span className={styles.alertIcon}>
        <ErrorIcon />
      </span>
      <div>
        <div className={styles.alertTitle}>{title}</div>
        {description}
      </div>
    </div>
  );
}
