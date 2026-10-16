import { AppLayout } from "app/AppLayout";
import { RequireAdmin } from "app/RequireAdmin";
import { ROUTES } from "app/routes";
import { CalculationPage } from "pages/CalculationPage";
import { ExperiencePage } from "pages/ExperiencePage";
import { FreePage } from "pages/FreePage";
import { FreeResultPage } from "pages/FreeResultPage";
import { HomePage } from "pages/HomePage";
import { ManageHomePage } from "pages/manage/ManageHomePage";
import { MarketManagePage } from "pages/manage/MarketManagePage";
import { ProductManagePage } from "pages/manage/ProductManagePage";
import { NotFoundPage } from "pages/NotFoundPage";
import { WalnutPage } from "pages/WalnutPage";
import { Route, Routes } from "react-router-dom";

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
