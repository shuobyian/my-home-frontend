import { WALNUT_MIN_LEVEL } from "@/domain/experience";
import { useExperienceQuery } from "@/queries/experience";
import { Experience } from "@/types/experience";
import { formatNumber } from "@/lib/format";
import { Stack, Table, TableColumn, Text, Title } from "@/ui";

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
      <Text>현재 {WALNUT_MIN_LEVEL}렙 이상만 볼 수 있습니다.</Text>
      <Table
        size='small'
        rowKey={({ level }) => level}
        loading={isLoading}
        columns={columns}
        data={data?.filter(({ level }) => level >= WALNUT_MIN_LEVEL) ?? []}
        pagination={false}
      />
    </Stack>
  );
}
