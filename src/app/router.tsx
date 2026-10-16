import { AppLayout } from "app/AppLayout";
import { RequireAdmin } from "app/RequireAdmin";
import { ROUTES } from "app/routes";
import { CalculationPage } from "pages/CalculationPage";
import { ExperiencePage } from "pages/ExperiencePage";
import { FreePage } from "pages/FreePage";
import { FreeResultPage } from "pages/FreeResultPage";
import { HomePage } from "pages/HomePage";
import { NotFoundPage } from "pages/NotFoundPage";
import { WalnutPage } from "pages/WalnutPage";
import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

// 관리 화면은 관리자만 쓰므로 처음 들어갈 때 따로 불러온다(엑셀 처리 코드 포함)
const ManageHomePage = lazy(() =>
  import("pages/manage/ManageHomePage").then((m) => ({
    default: m.ManageHomePage,
  }))
);
const ProductManagePage = lazy(() =>
  import("pages/manage/ProductManagePage").then((m) => ({
    default: m.ProductManagePage,
  }))
);
const MarketManagePage = lazy(() =>
  import("pages/manage/MarketManagePage").then((m) => ({
    default: m.MarketManagePage,
  }))
);

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.WALNUT} element={<WalnutPage />} />
        <Route path={ROUTES.EXPERIENCE} element={<ExperiencePage />} />
        <Route path={ROUTES.FREE} element={<FreePage />} />
        <Route path={ROUTES.FREE_RESULT} element={<FreeResultPage />} />
        <Route path={ROUTES.CALCULATION} element={<CalculationPage />} />
        <Route element={<RequireAdmin />}>
          <Route path={ROUTES.MANAGE} element={<ManageHomePage />} />
          <Route path={ROUTES.MANAGE_PRODUCT} element={<ProductManagePage />} />
          <Route path={ROUTES.MANAGE_MARKET} element={<MarketManagePage />} />
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
