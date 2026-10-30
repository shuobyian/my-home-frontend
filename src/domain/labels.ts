import {
  ActivityAction,
  ActivityActionType,
  Category,
  CategoryType,
  ChangeTarget,
  ChangeTargetType,
  MarketGroup,
  MarketGroupType,
  ReportKind,
  ReportKindType,
  ReportStatus,
  ReportStatusType,
  Tool,
  ToolType,
} from "@/types/enums";

// Record로 정의해 enum 값이 추가되면 라벨 누락을 컴파일 시점에 잡는다
export const TOOL_LABEL: Record<Tool, string> = {
  [ToolType.WOOD]: "원목 작업대",
  [ToolType.FIRE_PIT]: "요리용 화덕",
  [ToolType.SEWING_MACHINE]: "재봉틀",
  [ToolType.LEATHER]: "가죽 작업대",
  [ToolType.BRAZIER]: "금속용 화로",
  [ToolType.POTTERY_WHEEL]: "도자기 물레",
  [ToolType.ALCHEMY_KETTLE]: "별님 연금솥",
  [ToolType.MIMI]: "미미 화덕",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  [CategoryType.NORMAL]: "일반",
  [CategoryType.EVENT]: "이벤트",
};

export const MARKET_GROUP_LABEL: Record<MarketGroup, string> = {
  [MarketGroupType.CROP]: "작물",
  [MarketGroupType.TREE_FRUIT]: "나무 열매",
  [MarketGroupType.TIMBER]: "목재",
  [MarketGroupType.LIVESTOCK]: "축산",
  [MarketGroupType.ROBIN_SHOP]: "로빈샵",
  [MarketGroupType.SEAFOOD]: "수산물",
  [MarketGroupType.SEA_GATHERING]: "바다 채집",
  [MarketGroupType.MINERAL]: "광물",
  [MarketGroupType.GEM]: "보석",
  [MarketGroupType.BUSH_GATHERING]: "수풀 채집",
  [MarketGroupType.STAR_FRUIT]: "별 열매",
  [MarketGroupType.STARLIGHT]: "별빛 재료",
  [MarketGroupType.BADGE]: "뱃지",
  [MarketGroupType.EVENT]: "이벤트",
  [MarketGroupType.ETC]: "기타",
};

// Select 옵션 (enum 정의 순서)
export const TOOL_OPTIONS = Object.values(ToolType).map((value) => ({
  value,
  label: TOOL_LABEL[value],
}));

export const CATEGORY_OPTIONS = Object.values(CategoryType).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

export const MARKET_GROUP_OPTIONS = Object.values(MarketGroupType).map(
  (value) => ({ value, label: MARKET_GROUP_LABEL[value] })
);

export function getToolLabel(tool: Tool) {
  return TOOL_LABEL[tool] ?? "";
}

export const REPORT_KIND_LABEL: Record<ReportKind, string> = {
  [ReportKindType.DATA]: "잘못된 수치·정보",
  [ReportKindType.BUG]: "버그",
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  [ReportStatusType.OPEN]: "접수",
  [ReportStatusType.RESOLVED]: "반영",
  [ReportStatusType.REJECTED]: "반려",
};

export const CHANGE_TARGET_LABEL: Record<ChangeTarget, string> = {
  [ChangeTargetType.EXPERIENCE]: "레벨 경험치",
  [ChangeTargetType.MARKET]: "시세",
  [ChangeTargetType.PRODUCT]: "물품",
  [ChangeTargetType.MATERIAL]: "물품 재료",
};

export const ACTIVITY_ACTION_LABEL: Record<ActivityAction, string> = {
  [ActivityActionType.SIGNUP]: "회원가입",
  [ActivityActionType.LOGIN]: "로그인",
  [ActivityActionType.LOGIN_FAILED]: "로그인 실패",
  [ActivityActionType.LOGOUT]: "로그아웃",
  [ActivityActionType.PROFILE_UPDATE]: "닉네임 변경",
  [ActivityActionType.PASSWORD_CHANGE]: "비밀번호 변경",
  [ActivityActionType.WITHDRAW]: "회원 탈퇴",
  [ActivityActionType.REPORT_CREATE]: "제보 작성",
  [ActivityActionType.REPORT_UPDATE]: "제보 수정",
  [ActivityActionType.REPORT_DELETE]: "제보 삭제",
  [ActivityActionType.REPORT_ANSWER]: "제보 처리",
};

const toOptions = <V extends string>(labels: Record<V, string>) =>
  (Object.keys(labels) as V[]).map((value) => ({
    value,
    label: labels[value],
  }));

export const REPORT_KIND_OPTIONS = toOptions(REPORT_KIND_LABEL);
export const REPORT_STATUS_OPTIONS = toOptions(REPORT_STATUS_LABEL);
export const CHANGE_TARGET_OPTIONS = toOptions(CHANGE_TARGET_LABEL);
export const ACTIVITY_ACTION_OPTIONS = toOptions(ACTIVITY_ACTION_LABEL);
