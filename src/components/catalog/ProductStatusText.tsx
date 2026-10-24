import { PRODUCT_STATUS_LABELS, ProductCheckStatus } from "@/domain/catalog";
import { ProductStatus } from "@/types/catalog";
import { Text } from "@/ui";

const STATUS_TONES: Record<ProductStatus, "success" | "warning" | "danger"> = {
  ok: "success",
  missing: "warning",
  stale: "warning",
  error: "danger",
};

// 물품 한 개의 결과 상태. 문제 문구는 title(마우스를 올리면 보임)로 붙인다. 점검 정보가 없으면 "-"
export function ProductStatusText({ status }: { status?: ProductCheckStatus }) {
  if (!status) return "-";
  return (
    <Text
      tone={STATUS_TONES[status.status]}
      title={status.messages.join("\n") || undefined}
    >
      {PRODUCT_STATUS_LABELS[status.status]}
    </Text>
  );
}
