import { lazy } from "react";

// 관리 화면은 관리자만 쓰므로 따로 불러온다(엑셀 처리 코드 포함).
// 같은 import()를 다시 부르면 이미 받은 모듈을 쓰므로, 미리 받기와 지연 로딩이 같은 코드를 공유한다.
const loadManageHome = () => import("@/pages/manage/ManageHomePage");
const loadProductManage = () => import("@/pages/manage/ProductManagePage");
const loadMarketManage = () => import("@/pages/manage/MarketManagePage");
const loadCatalogCheck = () => import("@/pages/manage/CatalogCheckPage");

export const ManageHomePage = lazy(() =>
  loadManageHome().then((m) => ({ default: m.ManageHomePage }))
);
export const ProductManagePage = lazy(() =>
  loadProductManage().then((m) => ({ default: m.ProductManagePage }))
);
export const MarketManagePage = lazy(() =>
  loadMarketManage().then((m) => ({ default: m.MarketManagePage }))
);
export const CatalogCheckPage = lazy(() =>
  loadCatalogCheck().then((m) => ({ default: m.CatalogCheckPage }))
);

// 관리자 확인 뒤 관리 화면 코드를 미리 받아 둔다. 화면 이동이 transition으로 처리되어
// 처음 여는 관리 메뉴는 코드를 받는 동안 아무 반응이 없기 때문이다.
// 받기에 실패하면 무시한다(그 화면으로 이동할 때 다시 받거나 새로고침을 안내한다).
export function preloadManagePages() {
  [
    loadManageHome,
    loadProductManage,
    loadMarketManage,
    loadCatalogCheck,
  ].forEach((load) => load().catch(() => {}));
}
