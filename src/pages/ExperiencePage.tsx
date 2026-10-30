import { useExperienceQuery } from "@/queries/experience";
import { Experience } from "@/types/experience";
import { formatNumber } from "@/lib/format";
import { Stack, Table, TableColumn, Title } from "@/ui";

const columns: TableColumn<Experience>[] = [
  {
    key: "level",
    title: "레벨",
    render: ({ level }) => formatNumber(level),
  },
  {
    key: "amount",
    title: "경험치",
    render: ({ amount }) => formatNumber(amount),
  },
];

export function ExperiencePage() {
  const { data, isLoading } = useExperienceQuery();

  return (
    <Stack vertical gap='var(--ui-space-3)'>
      <Title level={5}>레벨 별 경험치 입니다.</Title>
      <Table
        size='small'
        rowKey={({ level }) => level}
        loading={isLoading}
        columns={columns}
        data={data ?? []}
        pagination={false}
      />
    </Stack>
  );
}
