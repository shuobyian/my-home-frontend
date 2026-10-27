import { styles } from "@/components/common/Guide.styles";
import { ReactNode } from "react";
import { InfoIcon, Title } from "@/ui";

interface GuideProps {
  title: ReactNode;
  // 차례로 번호를 붙여 보여 줄 사용 방법(<li>들)
  steps?: ReactNode;
  // 단계 아래에 둘 화면별 내용
  children?: ReactNode;
}

// 화면 위쪽의 사용 안내 카드
export function Guide({ title, steps, children }: GuideProps) {
  return (
    <section css={styles.guide}>
      <div css={styles.header}>
        <span css={styles.icon}>
          <InfoIcon />
        </span>
        <Title level={4} css={styles.title}>
          {title}
        </Title>
      </div>
      {steps && <ol css={styles.steps}>{steps}</ol>}
      {children}
    </section>
  );
}
