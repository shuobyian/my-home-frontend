import { CSSProperties, HTMLAttributes, Ref } from "react";

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  // 자식 사이 간격(px)
  gap?: number;
  // 기본값: 가로는 세로 가운데 정렬, 세로는 자식을 가로로 늘린다
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  ref?: Ref<HTMLDivElement>;
}

// 간격·정렬·줄바꿈을 정하는 flex 묶음
export function Stack({
  vertical,
  gap = 8,
  align,
  justify,
  wrap,
  style,
  ...rest
}: StackProps) {
  return (
    <div
      {...rest}
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        flexWrap: wrap ? "wrap" : undefined,
        gap,
        alignItems: align ?? (vertical ? "stretch" : "center"),
        justifyContent: justify,
        ...style,
      }}
    />
  );
}
