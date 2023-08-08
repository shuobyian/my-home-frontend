import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useItemQuery } from "../queries/useItemQuery";

export function ItemList() {
  const { data: itemList } = useItemQuery();
  return (
    <Table sx={{ minWidth: 650 }} aria-label='simple table'>
      <TableHead>
        <TableRow>
          <TableCell>이름</TableCell>
          <TableCell align='right'>레벨</TableCell>
          <TableCell align='right'>크래프팅 가격</TableCell>
          <TableCell align='right'>재료</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {itemList?.map((item) => (
          <TableRow
            key={item.name}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell component='th' scope='row'>
              {item.name}
            </TableCell>
            <TableCell align='right'>{item.level}</TableCell>
            <TableCell align='right'>{item.craftingPrice}</TableCell>
            <TableCell align='right'>
              {
                <Stack gap={1} style={{ float: "right" }}>
                  {item.materials.map((material) => (
                    <Stack key={material.name} direction={"row"} gap={1}>
                      <div>{material.name}</div>
                      <div>{material.base ? "상위 재료" : "기본 재료"}</div>
                      <div>{material.count}</div>개
                    </Stack>
                  ))}
                </Stack>
              }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
