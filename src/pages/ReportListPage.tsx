import { ROUTES } from "@/app/routes";
import { ReportStatusText } from "@/components/report/ReportStatusText";
import { REPORT_KIND_LABEL, REPORT_STATUS_OPTIONS } from "@/domain/labels";
import { formatDateTime } from "@/lib/format";
import { useReportsQuery } from "@/queries/report";
import { useCurrentUser } from "@/state/auth";
import { ReportStatus } from "@/types/enums";
import { Report, ReportSearchParams } from "@/types/report";
import { useState } from "react";
import {
  createPath,
  generatePath,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router";
import {
  Button,
  FlagIcon,
  Segmented,
  Stack,
  Table,
  TableColumn,
  Text,
  Title,
} from "@/ui";

const ALL = "ALL";
const STATUS_FILTERS = [
  { value: ALL, label: "전체" },
  ...REPORT_STATUS_OPTIONS,
] as const;

const columns: TableColumn<Report>[] = [
  { key: "id", title: "번호", width: 64, align: "right", render: (r) => r.id },
  {
    key: "status",
    title: "상태",
    width: 64,
    render: (r) => <ReportStatusText status={r.status} />,
  },
  {
    key: "title",
    title: "제목",
    render: (r) => (
      <Stack vertical gap={0}>
        <Text strong>{r.title}</Text>
        <Text tone='secondary'>
          {REPORT_KIND_LABEL[r.kind]}
          {r.changes.length > 0 && ` · 바꿀 값 ${r.changes.length}개`}
        </Text>
      </Stack>
    ),
  },
  {
    key: "author",
    title: "작성자",
    width: 120,
    render: (r) => r.author?.nickname ?? "탈퇴한 회원",
  },
  {
    key: "createdAt",
    title: "작성일",
    width: 150,
    render: (r) => formatDateTime(r.createdAt),
  },
];

// 제보 게시판: 버그나 잘못된 수치·정보를 알린다. 로그인한 회원만 쓰고 보며,
// 회원에게는 자기 제보만, 관리자에게는 모든 제보가 보인다
export function ReportListPage() {
  const user = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useState<ReportSearchParams>({
    page: 0,
    size: 20,
  });
  const reports = useReportsQuery(user?.id, params);

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
    <Stack vertical>
      <Stack justify='space-between' wrap>
        <Stack vertical gap={0}>
          <Title level={4}>제보 게시판</Title>
          <Text>
            버그나 잘못된 수치·정보를 알려주세요. 어느 값이 얼마여야 하는지
            적으면 관리자가 확인해 반영합니다.
          </Text>
          {!user.isAdmin && (
            <Text tone='secondary'>내가 쓴 제보만 보입니다.</Text>
          )}
        </Stack>
        <Stack>
          <Button
            variant='primary'
            icon={<FlagIcon />}
            onClick={() => navigate(ROUTES.REPORT_NEW)}
          >
            제보하기
          </Button>
        </Stack>
      </Stack>
      <Segmented<ReportStatus | typeof ALL>
        aria-label='상태'
        value={params.status ?? ALL}
        options={STATUS_FILTERS}
        onChange={(value) =>
          setParams((prev) => ({
            ...prev,
            page: 0,
            status: value === ALL ? undefined : value,
          }))
        }
      />
      <Table
        columns={columns}
        data={reports.data?.content ?? []}
        rowKey={(r) => r.id}
        loading={reports.isFetching}
        emptyText='아직 제보가 없습니다.'
        onRowClick={(r) =>
          navigate(generatePath(ROUTES.REPORT_DETAIL, { id: String(r.id) }))
        }
        pagination={{
          page: params.page + 1,
          pageSize: params.size,
          total: reports.data?.totalElements ?? 0,
          onChange: (page, size) =>
            setParams((prev) => ({ ...prev, page: page - 1, size })),
        }}
      />
    </Stack>
  );
}
