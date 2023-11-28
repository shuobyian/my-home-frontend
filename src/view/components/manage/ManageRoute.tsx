import { Outlet } from "react-router-dom";
import { ManageModal } from "view/components/manage/modal/ManageModal";

export function ManageRoute() {
  return (
    <>
      <ManageModal />
      <Outlet />
    </>
  );
}
