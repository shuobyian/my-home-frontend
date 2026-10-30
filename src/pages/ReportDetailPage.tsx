import { getErrorMessage, MyHomeError } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { Panel } from "@/components/common/Panel";
import { ReportChangeTable } from "@/components/report/ReportChangeTable";
import { ReportStatusText } from "@/components/report/ReportStatusText";
import { REPORT_KIND_LABEL, REPORT_STATUS_OPTIONS } from "@/domain/labels";
import { formatDateTime } from "@/lib/format";
import {
  useAnswerReportMutation,
  useDeleteReportMutation,
  useReportQuery,
} from "@/queries/report";
import { useCurrentUser } from "@/state/auth";
import { ReportStatusType } from "@/types/enums";
import { Report } from "@/types/report";
import { useState } from "react";
import { generatePath, useNavigate, useParams } from "react-router";
import {
  Alert,
  Button,
  Field,
  Form,
  Paragraph,
  Result,
  Segmented,
  Spin,
  Stack,
  Text,
  TextArea,
  Title,
  useDialogs,
  useToast,
} from "@/ui";

// 제보 상세. 쓴 사람은 접수 상태일 때 고치거나 지우고, 관리자는 처리(반영·반려)하거나 지운다
export function ReportDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const report = useReportQuery(id);

  if (report.isError) {
    const notFound = MyHomeError.from(report.error).status === 404;
    return (
      <Result
        status={notFound ? "404" : "error"}
        title={
          notFound ? "존재하지 않는 제보입니다" : "제보를 불러오지 못했습니다"
        }
        description={notFound ? undefined : getErrorMessage(report.error)}
        actions={
          <Button onClick={() => navigate(ROUTES.REPORT)}>목록으로</Button>
        }
      />
    );
  }
  if (!report.data) return <Spin />;
  return <ReportDetail report={report.data} />;
}

function ReportDetail({ report }: { report: Report }) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const toast = useToast();
  const dialogs = useDialogs();
  const remove = useDeleteReportMutation(report.id);
  const open = report.status === ReportStatusType.OPEN;
  const mine = user !== null && report.author?.id === user.id;
  const canEdit = mine && open;
  const canDelete = canEdit || Boolean(user?.isAdmin);
  // 서버의 작성·수정 시각은 저장할 때 조금 달라서 보이는 시각(분)으로 비교한다
  const createdAt = formatDateTime(report.createdAt);
  const updatedAt = formatDateTime(report.updatedAt);

  const confirmDelete = () =>
    dialogs.confirm({
      title: "제보를 지울까요?",
      content: "지운 제보는 되돌릴 수 없습니다.",
      okText: "삭제",
      onOk: async () => {
        try {
          await remove.mutateAsync();
          toast.success("삭제되었습니다.");
          navigate(ROUTES.REPORT, { replace: true });
        } catch (error) {
          dialogs.alert({
            status: "error",
            title: "삭제하지 못했습니다",
            content: getErrorMessage(error),
          });
        }
      },
    });

  return (
    <Stack vertical>
      <Stack justify='space-between' align='flex-start' wrap>
        <Stack vertical gap={0}>
          <Text tone='secondary'>
            #{report.id} · {REPORT_KIND_LABEL[report.kind]}
          </Text>
          <Title level={4}>{report.title}</Title>
          <Text tone='secondary'>
            <ReportStatusText status={report.status} /> ·{" "}
            {report.author?.nickname ?? "탈퇴한 회원"} · {createdAt}
            {updatedAt !== createdAt && ` (수정 ${updatedAt})`}
          </Text>
        </Stack>
        <Stack>
          <Button onClick={() => navigate(ROUTES.REPORT)}>목록</Button>
          {canEdit && (
            <Button
              onClick={() =>
                navigate(
                  generatePath(ROUTES.REPORT_EDIT, { id: String(report.id) })
                )
              }
            >
              수정
            </Button>
          )}
          {canDelete && (
            <Button danger loading={remove.isPending} onClick={confirmDelete}>
              삭제
            </Button>
          )}
        </Stack>
      </Stack>
      {report.content && (
        <Paragraph style={{ whiteSpace: "pre-wrap" }}>
          {report.content}
        </Paragraph>
      )}
      {report.changes.length > 0 && (
        <Stack vertical gap='var(--ui-space-2)'>
          <Text strong>바꿀 값</Text>
          <ReportChangeTable changes={report.changes} />
        </Stack>
      )}
      {report.answer && (
        <Panel style={{ padding: "var(--ui-space-4)" }}>
          <Text strong>관리자 답변</Text>
          <Paragraph style={{ whiteSpace: "pre-wrap", margin: 0 }}>
            {report.answer}
          </Paragraph>
        </Panel>
      )}
      {user?.isAdmin && <AnswerForm key={report.updatedAt} report={report} />}
    </Stack>
  );
}

// 관리자 처리. 반영으로 바꿔도 데이터는 바뀌지 않으므로 관리 화면에서 따로 고친다
function AnswerForm({ report }: { report: Report }) {
  const toast = useToast();
  const answer = useAnswerReportMutation(report.id);
  const [status, setStatus] = useState(report.status);
  const [text, setText] = useState(report.answer);

  return (
    <Panel style={{ padding: "var(--ui-space-4)" }}>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          answer.mutate(
            { status, answer: text },
            { onSuccess: () => toast.success("처리했습니다.") }
          );
        }}
      >
        <Text strong>제보 처리 (관리자)</Text>
        <Field label='상태'>
          <Segmented
            value={status}
            options={REPORT_STATUS_OPTIONS}
            onChange={setStatus}
          />
        </Field>
        <Field label='답변' help='제보한 회원에게 보입니다.'>
          <TextArea value={text} onChange={setText} rows={3} maxLength={2000} />
        </Field>
        {answer.error != null && (
          <Alert title={getErrorMessage(answer.error)} />
        )}
        <Button type='submit' variant='primary' loading={answer.isPending}>
          처리 저장
        </Button>
      </Form>
    </Panel>
  );
}
