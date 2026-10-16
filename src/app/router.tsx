import { AppLayout } from "app/AppLayout";
import { RequireAdmin } from "app/RequireAdmin";
import { ROUTES } from "app/routes";
import { NotFoundPage } from "pages/NotFoundPage";
import { Route, Routes } from "react-router-dom";
import { Calculation } from "view/pages/calculation";
import { Experience } from "view/pages/experience";
import { Free } from "view/pages/free";
import { FreeResult } from "view/pages/free/result";
import { Home } from "view/pages/home";
import { Manage } from "view/pages/manage";
import { Market } from "view/pages/manage/market";
import { Product } from "view/pages/manage/product";
import { Walnut } from "view/pages/walnut";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.WALNUT} element={<Walnut />} />
        <Route path={ROUTES.EXPERIENCE} element={<Experience />} />
        <Route path={ROUTES.FREE} element={<Free />} />
        <Route path={ROUTES.FREE_RESULT} element={<FreeResult />} />
        <Route path={ROUTES.CALCULATION} element={<Calculation />} />
        <Route element={<RequireAdmin />}>
          <Route path={ROUTES.MANAGE} element={<Manage />} />
          <Route path={ROUTES.MANAGE_PRODUCT} element={<Product />} />
          <Route path={ROUTES.MANAGE_MARKET} element={<Market />} />
        </Route>
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
