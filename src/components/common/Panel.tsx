import { CSSProperties, ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  style?: CSSProperties;
}

// 검색창·결과 묶음 등에 쓰는 테두리 상자(여러 화면에 같은 인라인 스타일이 반복되던 것을 통일)
export function Panel({ children, style }: PanelProps) {
  return (
    <div
      style={{
        padding: 10,
        border: "1px solid #eeeeee",
        borderRadius: 10,
        background: "white",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
