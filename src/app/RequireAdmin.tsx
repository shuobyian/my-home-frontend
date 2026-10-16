import { Outlet } from "react-router-dom";
import { ManageModal } from "view/components/manage/modal/ManageModal";

// 관리 화면 진입 시 비밀번호 모달을 띄운다.
// 서버 인증이 없어 UI 게이트일 뿐이며, 인증 단계에서 교체한다(R10).
export function RequireAdmin() {
  return (
    <>
      <ManageModal />
      <Outlet />
    </>
  );
}
