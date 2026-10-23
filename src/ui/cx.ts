// 조건부 클래스 이름을 합친다. 남는 게 없으면 class 속성을 아예 빼도록 undefined를 돌려준다.
export function cx(...names: (string | false | null | undefined)[]) {
  return names.filter(Boolean).join(" ") || undefined;
}
