import {
  CATEGORY_LABEL,
  CATEGORY_OPTIONS,
  MARKET_GROUP_LABEL,
  MARKET_GROUP_OPTIONS,
  REPORT_STATUS_LABEL,
  TOOL_LABEL,
  TOOL_OPTIONS,
} from "@/domain/labels";
import { formatNumber } from "@/lib/format";
import {
  ActivityActionType,
  ChangeTarget,
  ChangeTargetType,
  ReportStatus,
} from "@/types/enums";
import { Experience } from "@/types/experience";
import { Market } from "@/types/market";
import { Product } from "@/types/product";
import { ActivityLog, ChangeValue, ReportChangeInput } from "@/types/report";

// 숫자는 정수(int)·소수(float), enum은 고를 수 있는 값 목록을 가진다
export type ChangeFieldKind =
  | { type: "int" }
  | { type: "float" }
  | { type: "text" }
  | {
      type: "enum";
      options: readonly { value: string; label: string }[];
      labels: Record<string, string>;
    };

export interface ChangeField {
  field: string;
  label: string;
  kind: ChangeFieldKind;
}

const INT = { type: "int" } as const;
const TEXT = { type: "text" } as const;
const TOOL = {
  type: "enum",
  options: TOOL_OPTIONS,
  labels: TOOL_LABEL,
} as const;
const CATEGORY = {
  type: "enum",
  options: CATEGORY_OPTIONS,
  labels: CATEGORY_LABEL,
} as const;
const MARKET_GROUP = {
  type: "enum",
  options: MARKET_GROUP_OPTIONS,
  labels: MARKET_GROUP_LABEL,
} as const;

// 대상마다 바꿀 수 있는 값. 필드 이름은 각 API 응답과 같고, 서버 목록
// (my-home-backend apps/reports/changes.py)과 같아야 한다. 자주 고치는 값을 앞에 둔다
export const CHANGE_FIELDS: Record<ChangeTarget, readonly ChangeField[]> = {
  [ChangeTargetType.EXPERIENCE]: [
    { field: "amount", label: "필요 경험치", kind: INT },
  ],
  [ChangeTargetType.MARKET]: [
    { field: "price", label: "가격", kind: INT },
    { field: "name", label: "이름", kind: TEXT },
    { field: "group", label: "얻는 곳", kind: MARKET_GROUP },
  ],
  [ChangeTargetType.PRODUCT]: [
    { field: "level", label: "레벨", kind: INT },
    { field: "craftingPrice", label: "제작 비용", kind: INT },
    { field: "tool", label: "제작 도구", kind: TOOL },
    { field: "category", label: "분류", kind: CATEGORY },
    { field: "name", label: "이름", kind: TEXT },
  ],
  [ChangeTargetType.MATERIAL]: [
    { field: "count", label: "개수", kind: { type: "float" } },
    { field: "name", label: "이름", kind: TEXT },
  ],
};

export function findChangeField(target: ChangeTarget, field: string) {
  return CHANGE_FIELDS[target].find((item) => item.field === field);
}

// 값을 화면에 보여 주는 형태로(숫자는 천 단위 구분, enum은 이름)
export function formatChangeValue(
  target: ChangeTarget,
  field: string,
  value: ChangeValue | undefined
) {
  if (value === undefined) return "";
  const kind = findChangeField(target, field)?.kind;
  if (typeof value === "number") return formatNumber(value);
  if (kind?.type === "enum") return kind.labels[value] ?? value;
  return value;
}

// 바꿀 값으로 고를 수 있는 데이터 하나와 그 현재 값
export interface ChangeCandidate {
  id: number;
  label: string;
  values: Record<string, ChangeValue>;
}

export function buildChangeCandidates({
  experiences,
  markets,
  products,
}: {
  experiences: readonly Experience[];
  markets: readonly Market[];
  products: readonly Product[];
}): Record<ChangeTarget, ChangeCandidate[]> {
  return {
    [ChangeTargetType.EXPERIENCE]: [...experiences]
      .sort((a, b) => a.level - b.level)
      .map(({ id, level, amount }) => ({
        id,
        label: `${level}레벨`,
        values: { amount },
      })),
    [ChangeTargetType.MARKET]: markets.map(({ id, name, price, group }) => ({
      id,
      label: name,
      values: { name, price, group: group ?? "ETC" },
    })),
    [ChangeTargetType.PRODUCT]: products.map(
      ({ id, name, level, craftingPrice, tool, category }) => ({
        id,
        label: name,
        values: { name, level, craftingPrice, tool, category },
      })
    ),
    [ChangeTargetType.MATERIAL]: products.flatMap((product) =>
      product.materials.flatMap(({ id, name, count }) =>
        id === undefined
          ? []
          : [
              {
                id,
                label: `${product.name} · ${name}`,
                values: { name, count },
              },
            ]
      )
    ),
  };
}

// 입력 중인 바꿀 값 한 줄. 값은 입력한 글자 그대로 두고 보낼 때 숫자로 바꾼다
export interface ChangeDraft {
  // 줄의 React key(보낼 때 뺀다)
  key: number;
  target: ChangeTarget;
  targetId?: number;
  field: string;
  value: string;
}

// 종류를 바꾸면 고른 대상도 비운다(targetId를 undefined로 덮어쓴다)
export function createChangeDraft(
  key: number,
  target: ChangeTarget = ChangeTargetType.EXPERIENCE
): ChangeDraft {
  return {
    key,
    target,
    targetId: undefined,
    field: CHANGE_FIELDS[target][0].field,
    value: "",
  };
}

function parseValue(kind: ChangeFieldKind, raw: string): ChangeValue | null {
  const text = raw.trim();
  if (kind.type === "int" || kind.type === "float") {
    // 천 단위 구분 기호는 빼고 읽는다
    const number = Number(text.replaceAll(",", ""));
    if (text === "" || !Number.isFinite(number)) return null;
    if (kind.type === "int" && !Number.isInteger(number)) return null;
    return number;
  }
  return text === "" ? null : text;
}

// 서버에 보낼 값. 틀린 곳이 있으면 error에 안내를 담는다(서버도 같은 규칙으로 다시 검사한다)
export function toChangeInput(
  draft: ChangeDraft,
  candidates: Record<ChangeTarget, ChangeCandidate[]>
): { input?: ReportChangeInput; error?: string } {
  const candidate = candidates[draft.target].find(
    ({ id }) => id === draft.targetId
  );
  if (!candidate) return { error: "바꿀 대상을 골라주세요." };
  const field = findChangeField(draft.target, draft.field);
  if (!field) return { error: "바꿀 항목을 골라주세요." };
  const value = parseValue(field.kind, draft.value);
  if (value === null) {
    return {
      error:
        field.kind.type === "int"
          ? "정수를 입력해주세요."
          : field.kind.type === "float"
            ? "숫자를 입력해주세요."
            : "바른 값을 입력해주세요.",
    };
  }
  if (value === candidate.values[draft.field]) {
    return { error: "현재 값과 같습니다." };
  }
  return {
    input: {
      target: draft.target,
      targetId: candidate.id,
      field: draft.field,
      value,
    },
  };
}

// 활동 로그의 내용 한 줄(제보 번호·제목, 닉네임 변경 전후). 그 밖의 회원 활동은 빈 문자열
export function describeActivity({ action, reportId, detail }: ActivityLog) {
  const text = (key: string) => {
    const value = detail[key];
    return typeof value === "string" ? value : "";
  };
  if (action === ActivityActionType.PROFILE_UPDATE) {
    return `${text("before")} → ${text("after")}`;
  }
  if (reportId === null) return "";
  const status = REPORT_STATUS_LABEL[text("status") as ReportStatus];
  const answered =
    action === ActivityActionType.REPORT_ANSWER && status ? ` → ${status}` : "";
  return `#${reportId} ${text("title")}${answered}`;
}
