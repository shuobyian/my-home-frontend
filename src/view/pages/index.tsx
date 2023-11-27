import { Outlet, Route, Routes } from "react-router-dom";
import { ManageRoute } from "view/components/manage/ManageRoute";
import { Free } from "view/pages/free";
import { FreeResult } from "view/pages/free/result";
import { Home } from "view/pages/home";
import { Manage } from "view/pages/manage";
import { Item } from "view/pages/manage/item";
import { Market } from "view/pages/manage/market";

export function Router() {
  return (
    <Routes>
      <Route path={"/administrator"} element={<ManageRoute />}>
        <Route index element={<Manage />} />
        <Route path={"item"} element={<Item />} />
        <Route path={"market"} element={<Market />} />
      </Route>
      <Route path={""} element={<Home />} />
      <Route path={"free"} element={<Outlet />}>
        <Route index element={<Free />} />
        <Route path={"result"} element={<FreeResult />} />
      </Route>
    </Routes>
  );
}
