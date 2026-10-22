import { createPath, useLocation, useNavigate } from "react-router";

// 경로로 이동하되, 지금과 같은 주소면 히스토리에 쌓지 않는다(Link와 같은 규칙).
// replace도 새 location.key를 만들므로 오류 화면 초기화와 재요청은 그대로 일어난다.
export function useNavigateTo() {
  const navigate = useNavigate();
  const location = useLocation();
  return (to: string) => navigate(to, { replace: createPath(location) === to });
}
