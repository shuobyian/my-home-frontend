import { REPORT_STATUS_LABEL } from "@/domain/labels";
import { ReportStatus, ReportStatusType } from "@/types/enums";
import { Text } from "@/ui";

const TONE = {
  [ReportStatusType.OPEN]: "info",
  [ReportStatusType.RESOLVED]: "success",
  [ReportStatusType.REJECTED]: "secondary",
} as const;

export function ReportStatusText({ status }: { status: ReportStatus }) {
  return (
    <Text strong tone={TONE[status]}>
      {REPORT_STATUS_LABEL[status]}
    </Text>
  );
}
