import { preloadManagePages } from "@/app/managePages";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { ROUTES } from "@/app/routes";
import { AuthForm } from "@/components/auth/AuthForm";
import { useLoginMutation } from "@/queries/auth";
import { Suspense, useEffect, useState } from "react";
import {
  createPath,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import { useCurrentUser } from "@/state/auth";
import { Button, Modal, Paragraph, Result, Spin } from "@/ui";

// 관리 화면 게이트. 관리 메뉴는 AppNav의 ADMIN_MENU가 맡는다. 관리자로 로그인하기 전에는 관리 화면을 그리지 않아
// 관리 API 요청과 관리 화면 코드 다운로드가 일어나지 않는다.
// 실제 보호는 서버가 한다(쓰기 API는 관리자 토큰이 있어야 한다).
export function RequireAdmin() {
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin === true;
  // 관리 화면을 연 뒤인지. 보는 중에 관리자 로그인이 풀리면(만료·토큰 거절·로그아웃,
  // 다른 탭에서 로그아웃하거나 일반 회원으로 로그인) 화면을 내리지 않고 그 위에서 다시 로그인하게 해,
  // 저장하지 않은 입력을 지킨다.
  const [opened, setOpened] = useState(isAdmin);
  if (isAdmin && !opened) setOpened(true);

  // 확인이 끝나면 관리 화면 코드를 미리 받아 메뉴 이동이 바로 반응하게 한다
  useEffect(() => {
    if (isAdmin) preloadManagePages();
  }, [isAdmin]);

  if (!isAdmin && !opened) {
    // 로그인하면 이 화면으로 돌아온다
    if (!user) {
      return (
        <Navigate
          to={ROUTES.LOGIN}
          state={{ from: createPath(location) }}
          replace
        />
      );
    }
    return (
      <Result
        status='warning'
        title='관리자만 입장 가능합니다.'
        description='관리자 계정으로 로그인해주세요.'
        actions={
          <Button variant='primary' onClick={() => navigate(ROUTES.HOME)}>
            홈으로
          </Button>
        }
      />
    );
  }

  return (
    <>
      {/* 관리 화면 코드를 받는 중이거나 오류가 나도 다시 로그인 창은 그대로 둔다 */}
      <RouteErrorBoundary>
        <Suspense fallback={<Spin />}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
      {!isAdmin && <ReLoginModal />}
    </>
  );
}

// 관리자로 다시 로그인하면 닫히고, 닫으면 관리 화면에서 나간다.
// 로그인이 풀릴 때마다 새로 그려 지난 입력·서버 오류를 남기지 않는다.
function ReLoginModal() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const login = useLoginMutation();

  return (
    <Modal
      open
      title='다시 로그인해주세요'
      width={420}
      onClose={() => navigate(ROUTES.HOME)}
    >
      <Paragraph>
        {user
          ? `${user.username} 계정은 관리자가 아닙니다.`
          : "로그인이 풀렸습니다."}{" "}
        관리자 계정으로 다시 로그인하면 입력한 내용 그대로 이어서 저장할 수
        있습니다.
      </Paragraph>
      <AuthForm
        mode='login'
        loading={login.isPending}
        error={login.error}
        onSubmit={(credentials) => login.mutate(credentials)}
      />
    </Modal>
  );
}
