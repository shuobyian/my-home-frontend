import { Outlet, Route, Routes } from "react-router-dom";
import { Home } from "../Home";
import { ItemList } from "../ItemList";
import { Manage } from "./Manage";
import { MarketList } from "../MarketList";

export function Router() {
  return (
    <Routes>
      <Route path={"/administrator/manage/myhome"} element={<Outlet />}>
        <Route index element={<Manage />} />
        <Route path={"item"} element={<ItemList />} />
        <Route path={"market"} element={<MarketList />} />
      </Route>
      <Route path={""} element={<Home />} />
    </Routes>
  );
}
