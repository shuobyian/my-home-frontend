import { Table, TableColumnsType, Typography } from "antd";
import { WALNUT_MIN_LEVEL } from "domain/experience";
import { useExperienceQuery } from "queries/experience";
import { Experience } from "types/experience";
import { formatNumber } from "lib/format";

export function ExperiencePage() {
  const { data, isLoading } = useExperienceQuery();
  const columns: TableColumnsType<Experience> = [
    {
      title: "레벨",
      dataIndex: "level",
      key: "level",
      render: (level) => formatNumber(level),
    },
    {
      title: "경험치",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => formatNumber(amount),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <Typography.Title level={5}>레벨 별 경험치 입니다.</Typography.Title>
      <Typography.Text>
        현재 {WALNUT_MIN_LEVEL}렙 이상만 볼 수 있습니다.
      </Typography.Text>
      <Table
        size='small'
        rowKey='level'
        loading={isLoading}
        columns={columns}
        dataSource={
          data?.filter(({ level }) => level >= WALNUT_MIN_LEVEL) ?? []
        }
        pagination={false}
      />
    </div>
  );
}
