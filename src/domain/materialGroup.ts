// 기초 재료(시세)를 얻는 곳으로 나눈 묶음. 보여 주는 순서대로 적는다(프론트 전용 규칙).
// 서버에 분류가 없어 이름으로 묶는다. 여기 없는 새 재료는 마지막 '기타'로 간다
export const MATERIAL_GROUPS: readonly {
  label: string;
  names: readonly string[];
}[] = [
  {
    label: "작물",
    names: [
      "밀",
      "딸기",
      "토마토",
      "솜",
      "당근",
      "감자",
      "옥수수",
      "사탕수수",
      "포도",
      "라벤더",
      "양배추",
      "바닐라",
      "콩",
      "아스파라거스",
      "블루베리",
      "노란장미",
      "찻잎",
    ],
  },
  {
    label: "과일·나무 열매",
    names: [
      "사과",
      "오렌지",
      "복숭아",
      "고무",
      "커피",
      "카카오",
      "바나나",
      "야자열매",
      "체리",
      "레몬",
    ],
  },
  {
    label: "목재",
    names: ["전나무 목재", "단풍나무 목재", "오동나무 목재", "호두나무 목재"],
  },
  {
    label: "축산 식재료",
    names: ["우유", "달걀", "꿀", "소고기", "닭고기", "양고기"],
  },
  {
    label: "털·가죽",
    names: [
      "양털",
      "토끼털",
      "거위털",
      "누에고치",
      "양가죽",
      "소가죽",
      "말가죽",
    ],
  },
  {
    label: "수산물",
    names: ["꽁치", "새우", "랍스터", "연어", "참치", "상어", "고래"],
  },
  { label: "바다 채집", names: ["조개", "빨간 산호", "흰산호", "진주"] },
  {
    label: "광물",
    names: [
      "광천수",
      "흙",
      "철",
      "소금",
      "석회석",
      "은",
      "금",
      "알루미늄 원석",
      "백금 원석",
      "자갈",
    ],
  },
  {
    label: "보석",
    names: ["자수정", "에메랄드", "루비", "사파이어", "다이아몬드"],
  },
  { label: "원예", names: ["씨앗", "묘목", "나무 넝쿨"] },
  {
    label: "별 열매",
    names: ["빨간 별 열매", "노란 별 열매", "초록 별 열매", "파란 별 열매"],
  },
  {
    label: "별빛 재료",
    names: ["별빛 목재", "별빛 원석", "별빛 약수", "별빛 이끼"],
  },
  { label: "뱃지", names: ["데코협회 감사 뱃지", "데코협회 뱃지"] },
  { label: "이벤트", names: ["이스터 에그"] },
];

const OTHER_LABEL = "기타";

const GROUP_BY_NAME = new Map(
  MATERIAL_GROUPS.flatMap(({ label, names }) =>
    names.map((name) => [name, label] as const)
  )
);

// 재료를 묶음 순서대로 나눈다. 묶음 안은 받은 순서를 지키고, 재료가 없는 묶음은 뺀다
export function groupMaterials<T extends { name: string }>(
  materials: readonly T[]
): { label: string; items: T[] }[] {
  const byLabel = new Map<string, T[]>();
  for (const material of materials) {
    const label = GROUP_BY_NAME.get(material.name) ?? OTHER_LABEL;
    const items = byLabel.get(label);
    if (items) items.push(material);
    else byLabel.set(label, [material]);
  }
  return [...MATERIAL_GROUPS.map(({ label }) => label), OTHER_LABEL].flatMap(
    (label) => {
      const items = byLabel.get(label);
      return items ? [{ label, items }] : [];
    }
  );
}
