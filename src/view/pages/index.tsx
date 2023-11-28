import { Layout } from "antd";
import { Outlet, Route, Routes } from "react-router-dom";
import { ManageRoute } from "view/components/manage/ManageRoute";
import { Free } from "view/pages/free";
import { FreeResult } from "view/pages/free/result";
import { Home } from "view/pages/home";
import { Manage } from "view/pages/manage";
import { Market } from "view/pages/manage/market";

export function Router() {
  return (
    <Routes>
      <Route
        path=''
        element={
          <Layout style={{ padding: "10px 100px", width: "100vw" }}>
            <Outlet />
          </Layout>
        }
      >
        <Route path={"/manage"} element={<ManageRoute />}>
          <Route index element={<Manage />} />
          <Route path={"market"} element={<Market />} />
        </Route>
        <Route path={""} element={<Home />} />
        <Route path={"free"} element={<Outlet />}>
          <Route index element={<Free />} />
          <Route path={"result"} element={<FreeResult />} />
        </Route>
      </Route>
    </Routes>
  );
}
