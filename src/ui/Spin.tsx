import { ReactNode } from "react";
import { cx } from "./cx";
import styles from "./Spin.module.css";

// 글자 크기만 한 회전 표시(버튼 로딩 등에 쓴다). 읽을 내용이 없어 스크린 리더에서는 숨긴다.
export function Spinner({ className }: { className?: string }) {
  return <span className={cx(styles.spinner, className)} aria-hidden='true' />;
}

function Indicator() {
  return (
    <>
      <Spinner className={styles.large} />
      <span className='ui-sr-only'>불러오는 중</span>
    </>
  );
}

interface SpinProps {
  // children과 함께 쓸 때만 의미가 있다(단독으로 쓰면 항상 보인다)
  spinning?: boolean;
  children?: ReactNode;
  className?: string;
}

// 단독: 가운데에 큰 회전 표시. children과 함께: 불러오는 동안 내용을 흐리게 하고 위에 덮는다.
export function Spin({ spinning = true, children, className }: SpinProps) {
  if (children === undefined) {
    return (
      <div role='status' className={cx(styles.standalone, className)}>
        <Indicator />
      </div>
    );
  }

  return (
    <div
      className={cx(styles.container, className)}
      aria-busy={spinning || undefined}
    >
      <div className={spinning ? styles.dimmed : undefined}>{children}</div>
      {spinning && (
        <div role='status' className={styles.overlay}>
          <Indicator />
        </div>
      )}
    </div>
  );
}
