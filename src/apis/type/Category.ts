export const Category = {
  NORMAL: "NORMAL",
  EVENT: "EVENT",
} as const;
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
