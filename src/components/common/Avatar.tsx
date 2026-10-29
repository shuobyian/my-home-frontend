// 닉네임 첫 글자를 넣은 동그라미(메뉴의 프로필, 프로필 화면). 장식이라 스크린 리더에는 읽지 않는다.
// 이모지처럼 두 코드 단위로 된 글자도 자르지 않도록 글자 단위로 나눈다.
export function Avatar({ name, size }: { name: string; size: number }) {
  return (
    <span
      aria-hidden='true'
      style={{
        display: "inline-flex",
        flex: "none",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size * 0.45,
        fontWeight: "var(--ui-font-weight-semibold)",
        color: "var(--ui-color-text-inverse)",
        background: "var(--ui-color-primary)",
        borderRadius: "50%",
      }}
    >
      {[...name][0]?.toUpperCase()}
    </span>
  );
}
