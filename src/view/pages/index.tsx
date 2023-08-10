import { Outlet, Route, Routes } from "react-router-dom";
import { Home } from "../Home";
import { ItemList } from "../ItemList";
import { Manage } from "./Manage";

export function Router() {
  return (
    <Routes>
      <Route path={"/manage"} element={<Outlet />}>
        <Route index element={<Manage />} />
        <Route path={"list"} element={<ItemList />} />
      </Route>
      <Route path={""} element={<Home />} />
    </Routes>
  );
}
