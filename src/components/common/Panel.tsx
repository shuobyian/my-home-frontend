import { CSSProperties, ReactNode } from "react";
import { styles } from "./Panel.styles";

interface PanelProps {
  children: ReactNode;
  style?: CSSProperties;
}

// 검색창·결과 묶음 등에 쓰는 공통 패널
export function Panel({ children, style }: PanelProps) {
  return (
    <div css={styles.panel} style={style}>
      {children}
    </div>
  );
}
