import { Container, Stack, TableCell, TableRow } from "@mui/material";
import { getToolLabel } from "apis/type/Tool";
import { useItemQuery } from "queries/useItemQuery";
import { useState } from "react";
import { StringUtil } from "util/StringUtil";
import { Table } from "view/components/Table";

export function Item() {
  const [params, setParams] = useState({ page: 0, size: 5 });
  const { data: items } = useItemQuery(params);

  return (
    <Container maxWidth='lg'>
      <Table
        head={[
          {
            key: "name",
            value: "물품명",
            props: { width: "300px" },
          },
          {
            key: "tool",
            value: "제작 도구",
            props: { width: "200px", align: "right" },
          },
          {
            key: "level",
            value: "레벨",
            props: { width: "100px", align: "right" },
          },
          {
            key: "craftingPrice",
            value: "크래프팅 가격",
            props: { width: "200px", align: "right" },
          },
          {
            key: "materials",
            value: "재료",
            props: { width: "400px", align: "left" },
          },
        ]}
        pagination={{
          page: params.page,
          size: params.size,
          total: items?.totalElements ?? 0,
          onChange: (page) => setParams((prev) => ({ ...prev, page })),
        }}
      >
        {items?.content.map((item) => (
          <TableRow
            key={item.name}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component='th' scope='row'>
              {item.name}
            </TableCell>
            <TableCell align='right'>{getToolLabel(item.tool)}</TableCell>
            <TableCell align='right'>{item.level}</TableCell>
            <TableCell align='right'>
              {StringUtil.numberWithCommas(item.craftingPrice)}골드
            </TableCell>
            <TableCell style={{ height: "110px" }}>
              {
                <Stack gap={1}>
                  {item.materials.map((material) => (
                    <Stack key={material.name} direction={"row"} gap={1}>
                      <div>{material.name}</div>
                      <div>{material.base ? "상위 재료" : "기본 재료"}</div>
                      <div>{StringUtil.numberWithCommas(material.count)}</div>개
                    </Stack>
                  ))}
                </Stack>
              }
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </Container>
  );
}