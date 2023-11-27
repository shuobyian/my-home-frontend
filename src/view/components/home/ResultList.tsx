import { TableCell } from "@mui/material";
import { Result } from "apis/getResults";
import { getToolLabel } from "apis/type/Tool";
import { ResultDetail } from "view/components/home/ResultDetail";
import { Row } from "view/components/Row";
import { Table } from "view/components/Table";

interface IResultListProps {
  pagination?: {
    page: number;
    size: number;
    total: number;
    onChange: (page: number) => void;
  };
  contents: Result[];
}

export function ResultList({ pagination, contents }: IResultListProps) {
  return (
    <Table
      head={[
        { key: "select", value: "" },
        { key: "name", value: "물품명" },
        { key: "tool", value: "제작 도구", props: { align: "right" } },
        { key: "level", value: "레벨", props: { align: "right" } },
      ]}
      pagination={pagination}
    >
      {contents.map((content) => (
        <Row key={content.id} collapse={<ResultDetail result={content} />}>
          <TableCell component='th' scope='row'>
            {content.name}
          </TableCell>
          <TableCell align='right'>{getToolLabel(content.item.tool)}</TableCell>
          <TableCell align='right'>{content.level}</TableCell>
        </Row>
      ))}
    </Table>
  );
}
