import { Route, Routes } from "react-router-dom";
import { ItemList } from "../ItemList";
import { Home } from "../Home";

export function Router() {
  return (
    <Routes>
      <Route path={"/list"} element={<ItemList />} />
      <Route path={""} element={<Home />} />
    </Routes>
  );
}
