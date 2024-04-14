import { Table, Typography } from "antd";
import { ColumnsType } from "antd/lib/table";
import { IExperience } from "apis/experience/getExperience";
import { useExperienceQuery } from "queries/experience/useExperienceQuery";
import { StringUtil } from "util/StringUtil";

export function Experience() {
  const { data } = useExperienceQuery();
  const columns: ColumnsType<IExperience> = [
    {
      title: "레벨",
      dataIndex: "level",
      key: "level",
      render: (level) => StringUtil.numberWithCommas(level),
    },
    {
      title: "경험치",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => StringUtil.numberWithCommas(amount),
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
      <Typography.Text>현재 55렙 이상만 볼 수 있습니다.</Typography.Text>
      <Table
        size='small'
        columns={columns}
        dataSource={data?.filter((data) => data.level >= 55) || []}
        pagination={false}
      />
    </div>
  );
}
