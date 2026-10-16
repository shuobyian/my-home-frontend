import { Result } from "types/result";

// 레벨별 필요 경험치
export interface Experience {
  id: number;
  level: number;
  amount: number;
}

export interface WalnutParams {
  presentLevel: number;
  presentExperience?: number;
  objectiveLevel?: number;
  productionPercent?: number;
}

export interface WalnutResponse {
  remindExperience: number;
  remindCount: number;
  ample: { result: Result };
}
