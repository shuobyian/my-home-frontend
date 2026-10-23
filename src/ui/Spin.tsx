import { ReactNode } from "react";
import { styles } from "./Spin.styles";

// 글자 크기만 한 회전 표시(버튼 로딩 등에 쓴다). 읽을 내용이 없어 스크린 리더에서는 숨긴다.
export function Spinner({ className }: { className?: string }) {
  return <span css={styles.spinner} className={className} aria-hidden='true' />;
}

function Indicator() {
  return (
    <>
      <Spinner css={styles.large} />
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
      <div role='status' css={styles.standalone} className={className}>
        <Indicator />
      </div>
    );
  }

  return (
    <div
      css={styles.container}
      className={className}
      aria-busy={spinning || undefined}
    >
      <div css={spinning && styles.dimmed}>{children}</div>
      {spinning && (
        <div role='status' css={styles.overlay}>
          <Indicator />
        </div>
      )}
    </div>
  );
}
