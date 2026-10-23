import { getErrorMessage } from "@/apis/errors";
import { preloadManagePages } from "@/app/managePages";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { ROUTES } from "@/app/routes";
import { AdminLogin } from "@/components/auth/AdminLogin";
import { useLoginMutation } from "@/queries/auth";
import { Suspense, useEffect, useState } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/state/auth";
import { Button, Segmented, Spin, Stack } from "@/ui";

const MANAGE_MENU = [
  { label: "Raw 엑셀 데이터", value: ROUTES.MANAGE },
  { label: "물품 리스트", value: ROUTES.MANAGE_PRODUCT },
  { label: "시세 리스트", value: ROUTES.MANAGE_MARKET },
];

// 관리 화면 게이트. 비밀번호를 확인하기 전에는 관리 화면을 그리지 않아
// 관리 API 요청과 관리 화면 코드 다운로드가 일어나지 않는다.
// 서버에 인증이 없으므로 화면을 숨기는 용도일 뿐이다(R10, 서버 인증은 별도 작업).
export function RequireAdmin() {
  const { isAdmin, markAdmin, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLoginMutation();
  const [loginError, setLoginError] = useState<string>();

  // 확인이 끝나면 관리 화면 코드를 미리 받아 메뉴 이동이 바로 반응하게 한다
  useEffect(() => {
    if (isAdmin) preloadManagePages();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AdminLogin
        loading={isPending}
        error={loginError}
        onSubmit={(password) => {
          setLoginError(undefined);
          login(password, {
            onSuccess: markAdmin,
            onError: (error) => setLoginError(getErrorMessage(error)),
          });
        }}
      />
    );
  }

  // 라우터와 같은 규칙(끝 슬래시 허용, 대소문자 무시)으로 현재 메뉴를 찾는다
  const selected = MANAGE_MENU.find(({ value }) =>
    matchPath(value, pathname)
  )?.value;

  return (
    <Stack vertical gap={24}>
      <Stack wrap justify='space-between'>
        <Segmented
          aria-label='관리 메뉴'
          options={MANAGE_MENU}
          value={selected}
          onChange={(value) => navigate(value)}
        />
        <Button onClick={logout}>관리 종료</Button>
      </Stack>
      {/* 관리 화면 코드를 받는 중이거나 오류가 나도 메뉴·'관리 종료'는 그대로 둔다 */}
      <RouteErrorBoundary>
        <Suspense fallback={<Spin />}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    </Stack>
  );
}
