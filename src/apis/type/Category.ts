export const Category = {
  NORMAL: "NORMAL",
  EVENT: "EVENT",
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare -- 값 객체와 유니온 타입을 같은 이름으로 쓰는 enum 패턴
export type Category = (typeof Category)[keyof typeof Category];

export const CategoryList = [
  {
    value: Category.NORMAL,
    label: "일반",
  },
  {
    value: Category.EVENT,
    label: "이벤트",
  },
];
