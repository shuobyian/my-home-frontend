import { ROUTES } from "@/app/routes";
import { DebounceInput } from "@/components/common/DebounceInput";
import {
  ACTIVITY_ACTION_LABEL,
  ACTIVITY_ACTION_OPTIONS,
} from "@/domain/labels";
import { describeActivity } from "@/domain/report";
import { formatDateTime } from "@/lib/format";
import { useActivityLogsQuery } from "@/queries/report";
import { ActivityAction } from "@/types/enums";
import { ActivityLog, ActivityLogSearchParams } from "@/types/report";
import { useState } from "react";
import { generatePath, Link } from "react-router";
import {
  Field,
  FieldRow,
  Select,
  Stack,
  Table,
  TableColumn,
  Text,
  Title,
} from "@/ui";

const columns: TableColumn<ActivityLog>[] = [
  {
    key: "createdAt",
    title: "시각",
    width: 150,
    render: (log) => formatDateTime(log.createdAt),
  },
  {
    key: "action",
    title: "활동",
    width: 110,
    render: (log) => (
      <Text tone={log.action === "LOGIN_FAILED" ? "danger" : undefined}>
        {ACTIVITY_ACTION_LABEL[log.action] ?? log.action}
      </Text>
    ),
  },
  {
    key: "username",
    title: "아이디",
    width: 130,
    render: (log) => (
      <>
        {log.username}
        {/* 탈퇴한 회원(로그인 실패는 원래 회원이 없다) */}
        {log.userId === null && log.action !== "LOGIN_FAILED" && (
          <Text tone='secondary'> (탈퇴)</Text>
        )}
      </>
    ),
  },
  {
    key: "detail",
    title: "내용",
    render: (log) => {
      const text = describeActivity(log);
      // 지워진 제보는 링크를 걸지 않는다
      return log.reportId !== null && log.action !== "REPORT_DELETE" ? (
        <Link
          to={generatePath(ROUTES.REPORT_DETAIL, { id: String(log.reportId) })}
        >
          {text}
        </Link>
      ) : (
        text
      );
    },
  },
  { key: "ip", title: "IP", width: 130, render: (log) => log.ip },
  {
    key: "userAgent",
    title: "기기",
    width: 200,
    ellipsis: true,
    render: (log) => log.userAgent,
  },
];

const ALL = "";

// 활동 로그(관리자): 로그인 이력과 회원 정보·제보 이력을 최근 것부터 본다
export function ActivityLogPage() {
  const [params, setParams] = useState<ActivityLogSearchParams>({
    page: 0,
    size: 50,
  });
  const logs = useActivityLogsQuery(params);

  return (
    <Stack vertical>
      <Stack vertical gap={0}>
        <Title level={4}>활동 로그</Title>
        <Text>
          로그인(실패 포함)·로그아웃·회원 정보 변경과 제보 작성·수정·삭제·처리
          이력입니다. IP는 프록시 헤더 기준이라 참고용입니다.
        </Text>
      </Stack>
      <FieldRow style={{ maxWidth: 560 }}>
        <Field label='활동'>
          <Select<ActivityAction | typeof ALL>
            value={params.action ?? ALL}
            options={[
              { value: ALL, label: "모든 활동" },
              ...ACTIVITY_ACTION_OPTIONS,
            ]}
            onChange={(action) =>
              setParams((prev) => ({
                ...prev,
                page: 0,
                action: action || undefined,
              }))
            }
          />
        </Field>
        <Field label='아이디'>
          <DebounceInput
            value={params.username ?? ""}
            placeholder='일부만 입력해도 됩니다'
            loading={logs.isFetching}
            onChange={(username) =>
              setParams((prev) => ({
                ...prev,
                page: 0,
                username: username.trim() || undefined,
              }))
            }
          />
        </Field>
      </FieldRow>
      <Table
        size='small'
        columns={columns}
        data={logs.data?.content ?? []}
        rowKey={(log) => log.id}
        loading={logs.isFetching}
        emptyText='로그가 없습니다.'
        pagination={{
          page: params.page + 1,
          pageSize: params.size,
          total: logs.data?.totalElements ?? 0,
          onChange: (page, size) =>
            setParams((prev) => ({ ...prev, page: page - 1, size })),
        }}
      />
    </Stack>
  );
}
