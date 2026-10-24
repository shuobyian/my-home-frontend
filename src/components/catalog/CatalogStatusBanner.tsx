import { ROUTES } from "@/app/routes";
import { formatNumber } from "@/lib/format";
import { Link } from "react-router";
import { CatalogCheck } from "@/types/catalog";
import { Stack, Text } from "@/ui";

interface CatalogStatusBannerProps {
  check?: CatalogCheck;
  loading?: boolean;
  error?: boolean;
}

// 관리 화면 위쪽의 한 줄 요약. 결과에 반영되지 않은 물품이 있으면 데이터 점검 화면으로 안내한다
export function CatalogStatusBanner({
  check,
  loading,
  error,
}: CatalogStatusBannerProps) {
  if (loading) return <Text tone='secondary'>점검 중…</Text>;
  if (error || !check) {
    return <Text tone='warning'>데이터 점검 정보를 불러오지 못했습니다.</Text>;
  }

  const errors = check.products.filter(
    ({ status }) => status === "error"
  ).length;
  const pending = check.products.filter(
    ({ status }) => status === "missing" || status === "stale"
  ).length;
  const link = <Link to={ROUTES.MANAGE_CHECK}>데이터 점검</Link>;

  if (errors + pending === 0) {
    return (
      <Stack wrap>
        <Text tone='success'>모든 물품이 결과 리스트에 반영되어 있습니다.</Text>
        {/* 물품과 상관없는 경고(이름 겹침, 호두작 물품 없음)도 놓치지 않게 알린다 */}
        {check.summary.warnings > 0 && (
          <>
            <Text tone='secondary'>
              확인할 점 {formatNumber(check.summary.warnings)}건
            </Text>
            {link}
          </>
        )}
      </Stack>
    );
  }
  return (
    <Stack wrap>
      <Text tone='danger'>
        결과에 반영되지 않은 물품 {formatNumber(errors + pending)}개 (오류{" "}
        {formatNumber(errors)} · 확인 필요 {formatNumber(pending)})
      </Text>
      {link}
    </Stack>
  );
}
