import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { ChangeEditor } from "@/components/report/ChangeEditor";
import { REPORT_KIND_OPTIONS } from "@/domain/labels";
import {
  buildChangeCandidates,
  ChangeDraft,
  createChangeDraft,
  toChangeInput,
} from "@/domain/report";
import { useExperienceQuery } from "@/queries/experience";
import { useMarketsQuery } from "@/queries/market";
import { useAllProductsQuery } from "@/queries/product";
import {
  useCreateReportMutation,
  useReportQuery,
  useUpdateReportMutation,
} from "@/queries/report";
import { useCurrentUser } from "@/state/auth";
import { ReportKind, ReportKindType, ReportStatusType } from "@/types/enums";
import { Report, ReportInput } from "@/types/report";
import { useMemo } from "react";
import {
  createPath,
  generatePath,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import {
  Alert,
  Button,
  Field,
  Form,
  Input,
  Result,
  Segmented,
  Spin,
  Stack,
  Text,
  TextArea,
  Title,
  useForm,
  useToast,
} from "@/ui";

// 서버(apps/reports/serializers.py)와 같은 한도
const MAX_CHANGES = 20;
const MAX_TITLE = 100;
const MAX_CONTENT = 5000;

interface ReportFormValues {
  kind: ReportKind;
  title: string;
  content: string;
  changes: ChangeDraft[];
}

// 제보 쓰기(/report/new)와 고치기(/report/:id/edit). 로그인한 회원만 쓴다
export function ReportFormPage() {
  const user = useCurrentUser();
  const location = useLocation();
  const { id } = useParams();

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
  return id === undefined ? (
    <NewReport />
  ) : (
    <EditReport id={Number(id)} userId={user.id} />
  );
}

function NewReport() {
  const save = useCreateReportMutation();
  return (
    <ReportEditor
      title='제보하기'
      initial={{
        kind: ReportKindType.DATA,
        title: "",
        content: "",
        changes: [createChangeDraft(0)],
      }}
      saving={save.isPending}
      error={save.error}
      onSave={(body, onSaved) => save.mutate(body, { onSuccess: onSaved })}
    />
  );
}

function EditReport({ id, userId }: { id: number; userId: number }) {
  const report = useReportQuery(id);
  const save = useUpdateReportMutation(id);

  if (report.isError) {
    return (
      <Result
        status='error'
        title='제보를 불러오지 못했습니다'
        description={getErrorMessage(report.error)}
      />
    );
  }
  if (!report.data) return <Spin />;
  if (
    report.data.author?.id !== userId ||
    report.data.status !== ReportStatusType.OPEN
  ) {
    return (
      <Result
        status='warning'
        title='고칠 수 없는 제보입니다'
        description='내가 쓴 접수 상태의 제보만 고칠 수 있습니다.'
      />
    );
  }
  return (
    <ReportEditor
      title='제보 고치기'
      initial={toFormValues(report.data)}
      saving={save.isPending}
      error={save.error}
      onSave={(body, onSaved) => save.mutate(body, { onSuccess: onSaved })}
    />
  );
}

function toFormValues(report: Report): ReportFormValues {
  return {
    kind: report.kind,
    title: report.title,
    content: report.content,
    changes: report.changes.map(({ target, targetId, field, after }, key) => ({
      key,
      target,
      targetId,
      field,
      value: String(after),
    })),
  };
}

interface ReportEditorProps {
  title: string;
  initial: ReportFormValues;
  saving: boolean;
  error: unknown;
  onSave: (body: ReportInput, onSaved: (report: Report) => void) => void;
}

function ReportEditor({
  title,
  initial,
  saving,
  error,
  onSave,
}: ReportEditorProps) {
  const navigate = useNavigate();
  const toast = useToast();
  // 바꿀 값으로 고를 데이터와 그 현재 값
  const experiences = useExperienceQuery();
  const markets = useMarketsQuery();
  const products = useAllProductsQuery();
  const candidates = useMemo(
    () =>
      experiences.data &&
      markets.data &&
      products.data &&
      buildChangeCandidates({
        experiences: experiences.data,
        markets: markets.data,
        products: products.data,
      }),
    [experiences.data, markets.data, products.data]
  );

  const form = useForm<ReportFormValues>(initial, (values) => {
    const errors: Record<string, string | undefined> = {
      title: values.title.trim() ? undefined : "제목을 입력해주세요.",
      content:
        values.content.trim() || values.changes.length > 0
          ? undefined
          : "내용이나 바꿀 값을 입력해주세요.",
    };
    if (candidates) {
      values.changes.forEach((draft, index) => {
        errors[`changes.${index}`] = toChangeInput(draft, candidates).error;
      });
    }
    return errors;
  });

  if (products.isError) {
    return (
      <Result
        status='error'
        title='물품 목록을 불러오지 못했습니다'
        description={getErrorMessage(products.error)}
      />
    );
  }
  if (!candidates) return <Spin />;

  const submit = (values: ReportFormValues) =>
    onSave(
      {
        kind: values.kind,
        title: values.title.trim(),
        content: values.content.trim(),
        changes: values.changes.flatMap(
          (draft) => toChangeInput(draft, candidates).input ?? []
        ),
      },
      (report) => {
        toast.success("제보를 저장했습니다.");
        navigate(
          generatePath(ROUTES.REPORT_DETAIL, { id: String(report.id) }),
          {
            replace: true,
          }
        );
      }
    );

  return (
    <Stack vertical>
      <Stack vertical gap={0}>
        <Title level={4}>{title}</Title>
        <Text>
          잘못된 값은 아래 "바꿀 값"에 대상과 바른 값을 골라 적어주세요. 예:
          레벨 경험치 · 90레벨 · 필요 경험치 · 10000000
        </Text>
      </Stack>
      <Form onSubmit={form.handleSubmit(submit)} style={{ maxWidth: 960 }}>
        <Field label='종류'>
          <Segmented
            value={form.values.kind}
            options={REPORT_KIND_OPTIONS}
            onChange={(kind) => form.set("kind", kind)}
          />
        </Field>
        <Field label='제목' required error={form.errors.title}>
          <Input
            value={form.values.title}
            onChange={(value) => form.set("title", value)}
            maxLength={MAX_TITLE}
          />
        </Field>
        <Field
          label='내용'
          help='버그라면 어떤 화면에서 무엇을 했을 때 생기는지 적어주세요.'
          error={form.errors.content}
        >
          <TextArea
            value={form.values.content}
            onChange={(value) => form.set("content", value)}
            rows={5}
            maxLength={MAX_CONTENT}
          />
        </Field>
        <Text strong>바꿀 값</Text>
        <ChangeEditor
          drafts={form.values.changes}
          candidates={candidates}
          errors={form.values.changes.map(
            (_, index) => form.errors[`changes.${index}`]
          )}
          max={MAX_CHANGES}
          onChange={(changes) => form.set("changes", changes)}
        />
        {error != null && <Alert title={getErrorMessage(error)} />}
        <Stack>
          <Button type='submit' variant='primary' loading={saving}>
            저장하기
          </Button>
          <Button onClick={() => navigate(-1)}>취소</Button>
        </Stack>
      </Form>
    </Stack>
  );
}
