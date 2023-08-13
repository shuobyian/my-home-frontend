import { Route, Routes } from "react-router-dom";
import { Home } from "view/Home";
import { ItemList } from "view/ItemList";
import { MarketList } from "view/MarketList";
import { ManageRoute } from "view/components/ManageRoute";
import { Manage } from "view/pages/Manage";

export function Router() {
  return (
    <Routes>
      <Route path={"/administrator/manage/myhome"} element={<ManageRoute />}>
        <Route index element={<Manage />} />
        <Route path={"item"} element={<ItemList />} />
        <Route path={"market"} element={<MarketList />} />
      </Route>
      <Route path={""} element={<Home />} />
    </Routes>
  );
}
