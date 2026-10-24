import { ROUTES } from "@/app/routes";
import {
  BoxIcon,
  HomeIcon,
  SlidersIcon,
  SpreadsheetIcon,
  TrendingUpIcon,
  WalnutIcon,
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

// 누구나 쓰는 메뉴. 장바구니는 화면 이동이 아니라 서랍이라 AppNav가 따로 그린다.
export const USER_MENU: readonly MenuItem[] = [
  { label: "홈", to: ROUTES.HOME, icon: <HomeIcon />, end: true },
  { label: "호두작", to: ROUTES.WALNUT, icon: <WalnutIcon /> },
  { label: "자유 모드", to: ROUTES.FREE, icon: <SlidersIcon /> },
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
];
