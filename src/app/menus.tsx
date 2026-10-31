import { ROUTES } from "@/app/routes";
import {
  BackpackIcon,
  BoxIcon,
  FlagIcon,
  HistoryIcon,
  HomeIcon,
  SlidersIcon,
  SpreadsheetIcon,
  TrendingUpIcon,
  WalnutIcon,
  WarningIcon,
} from "@/ui";
import { ReactNode } from "react";

export interface MenuItem {
  label: string;
  to: string;
  icon: ReactNode;
  // 하위 경로(/manage/product 등)에서는 활성으로 보지 않을 때만 true.
  // 그 밖에는 하위 경로(/free/result 등)에서도 활성으로 본다.
  end?: boolean;
}

// 누구나 쓰는 메뉴. 장바구니는 메뉴가 아니라 홈·시세 조작 모드 화면의 버튼(CartButton)으로 연다.
export const USER_MENU: readonly MenuItem[] = [
  { label: "홈", to: ROUTES.HOME, icon: <HomeIcon />, end: true },
  { label: "호두작", to: ROUTES.WALNUT, icon: <WalnutIcon /> },
  { label: "시세 조작 모드", to: ROUTES.FREE, icon: <SlidersIcon /> },
];

// 로그인한 회원에게만 보이는 메뉴(누구나 쓰는 메뉴 바로 아래). 화면은 로그인하지 않았으면 로그인으로 보낸다.
export const MEMBER_MENU: readonly MenuItem[] = [
  { label: "보유 재료", to: ROUTES.INVENTORY, icon: <BackpackIcon /> },
  // 회원은 자기 제보만, 관리자는 모든 제보를 본다
  { label: "제보 게시판", to: ROUTES.REPORT, icon: <FlagIcon /> },
];

// 관리자에게만 보이는 메뉴. 화면은 RequireAdmin이 한 번 더 막는다.
export const ADMIN_MENU: readonly MenuItem[] = [
  {
    label: "Raw 엑셀 데이터",
    to: ROUTES.MANAGE,
    icon: <SpreadsheetIcon />,
    end: true,
  },
  { label: "물품 리스트", to: ROUTES.MANAGE_PRODUCT, icon: <BoxIcon /> },
  { label: "시세 리스트", to: ROUTES.MANAGE_MARKET, icon: <TrendingUpIcon /> },
  { label: "데이터 점검", to: ROUTES.MANAGE_CHECK, icon: <WarningIcon /> },
  { label: "활동 로그", to: ROUTES.MANAGE_LOG, icon: <HistoryIcon /> },
];
