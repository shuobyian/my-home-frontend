import { styles } from "@/components/common/Guide.styles";
import { ReactNode } from "react";
import { InfoIcon, Title } from "@/ui";

interface GuideProps {
  title: ReactNode;
  // 화면의 주 버튼(장바구니 등). 768px 이상은 제목 오른쪽, 미만은 카드 맨 아래 오른쪽에 둔다
  action?: ReactNode;
  // 차례로 번호를 붙여 보여 줄 사용 방법(<li>들)
  steps?: ReactNode;
  // 단계 아래에 둘 화면별 내용
  children?: ReactNode;
}

// 화면 위쪽의 사용 안내 카드
export function Guide({ title, action, steps, children }: GuideProps) {
  return (
    <section css={styles.guide}>
      <span css={styles.icon}>
        <InfoIcon />
      </span>
      <Title level={4} css={styles.title}>
        {title}
      </Title>
      {action && <div css={styles.action}>{action}</div>}
      {(steps || children) && (
        <div css={styles.body}>
          {steps && <ol css={styles.steps}>{steps}</ol>}
          {children}
        </div>
      )}
    </section>
  );
}
