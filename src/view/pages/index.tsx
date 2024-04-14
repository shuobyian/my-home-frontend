import { Layout } from "antd";
import { Outlet, Route, Routes } from "react-router-dom";
import { ManageRoute } from "view/components/manage/ManageRoute";
import { Experience } from "view/pages/experience";
import { Free } from "view/pages/free";
import { FreeResult } from "view/pages/free/result";
import { Home } from "view/pages/home";
import { Manage } from "view/pages/manage";
import { Market } from "view/pages/manage/market";
import { Product } from "view/pages/manage/product";
import { Walnut } from "view/pages/walnut";

export function Router() {
  return (
    <Routes>
      <Route
        path=''
        element={
          <Layout
            style={{
              padding: window.outerWidth > 500 ? "10px 100px" : "10px",
            }}
          >
            <Outlet />
          </Layout>
        }
      >
        <Route path={"/manage"} element={<ManageRoute />}>
          <Route index element={<Manage />} />
          <Route path={"market"} element={<Market />} />
          <Route path={"product"} element={<Product />} />
        </Route>
        <Route path={""} element={<Home />} />
        <Route path={"experience"} element={<Experience />} />
        <Route path={"walnut"} element={<Walnut />} />
        <Route path={"free"} element={<Outlet />}>
          <Route index element={<Free />} />
          <Route path={"result"} element={<FreeResult />} />
        </Route>
      </Route>
    </Routes>
  );
}
