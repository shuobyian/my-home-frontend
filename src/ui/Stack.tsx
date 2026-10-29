import { CSSProperties, HTMLAttributes, Ref } from "react";

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  vertical?: boolean;
  // 숫자는 px로 쓰고 CSS 변수도 받을 수 있다
  gap?: number | CSSProperties["gap"];
  // 기본값: 가로는 세로 가운데 정렬, 세로는 자식을 가로로 늘린다
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  ref?: Ref<HTMLDivElement>;
}

// 간격·정렬·줄바꿈을 정하는 flex 묶음
export function Stack({
  vertical,
  gap = "var(--ui-space-2)",
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
