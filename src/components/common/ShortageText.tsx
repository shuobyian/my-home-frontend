import { styles } from "./ShortageText.styles";

// 원래 값 왼쪽에 작은 회색 글씨로 붙이는 '(N 부족)'
export function ShortageText({ children }: { children: string }) {
  return <span css={styles.shortage}>({children} 부족)</span>;
}
