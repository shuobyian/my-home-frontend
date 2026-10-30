import {
  ActivityAction,
  ChangeTarget,
  ReportKind,
  ReportStatus,
} from "@/types/enums";

// 바꿀 값의 값. 숫자 필드는 숫자, 이름은 문자열, 도구·분류는 enum 값이다
export type ChangeValue = string | number;

// 제보에 담긴 '어느 값이 무엇이어야 하는지' 한 줄.
// label·before는 쓸 때의 대상 이름과 값이라 데이터가 바뀌거나 지워져도 그대로다
export interface ReportChange {
  target: ChangeTarget;
  targetId: number;
  label: string;
  field: string;
  before: ChangeValue;
  after: ChangeValue;
}

export interface Report {
  id: number;
  kind: ReportKind;
  title: string;
  content: string;
  status: ReportStatus;
  // 관리자 답변
  answer: string;
  // 쓴 회원이 탈퇴했으면 null
  author: { id: number; nickname: string } | null;
  changes: ReportChange[];
  // ISO 8601 시각
  createdAt: string;
  updatedAt: string;
}

export interface ReportChangeInput {
  target: ChangeTarget;
  targetId: number;
  field: string;
  value: ChangeValue;
}

// 작성·수정 본문. 수정하면 바꿀 값은 통째로 바뀐다
export interface ReportInput {
  kind: ReportKind;
  title: string;
  content: string;
  changes: ReportChangeInput[];
}

// 관리자 처리. 보낸 필드만 바뀐다
export interface ReportAnswerInput {
  status?: ReportStatus;
  answer?: string;
}

export interface ReportSearchParams {
  page: number;
  size: number;
  status?: ReportStatus;
  kind?: ReportKind;
}

// 활동 로그(관리자만 본다). 회원·제보가 지워져도 남는다
export interface ActivityLog {
  id: number;
  action: ActivityAction;
  // 탈퇴한 회원이나 로그인 실패면 null
  userId: number | null;
  // 그때의 아이디(로그인 실패는 입력한 아이디)
  username: string;
  reportId: number | null;
  detail: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

export interface ActivityLogSearchParams {
  page: number;
  size: number;
  action?: ActivityAction;
  username?: string;
}
