import { Stack, TableCell, TableRow, Typography } from "@mui/material";
import { Result } from "../../apis/getResults";
import { Table } from "./Table";
import { StringUtil } from "../../util/StringUtil";

interface ResultDetailProps {
  result: Result;
}

export function ResultDetail({ result }: ResultDetailProps) {
  return (
    <div
      style={{
        border: "1px solid gray",
        borderRadius: "10px",
        padding: "10px",
      }}
    >
      <Stack gap='20px'>
        <Stack direction={"row"} gap='20px' justifyContent={"space-between"}>
          <Stack gap='15px'>
            <Stack direction={"row"} gap='10px'>
              <Typography fontWeight={700}>물품명</Typography>
              <Typography>{result.name}</Typography>
            </Stack>
            <Stack direction={"row"} gap='10px'>
              <Typography fontWeight={700}>필요 레벨</Typography>
              <Typography>Lv.{result.level} 이상</Typography>
            </Stack>
            <Stack direction={"row"} gap='10px'>
              <Typography fontWeight={700}>필요 금액</Typography>
              <Typography>
                {`${StringUtil.numberWithCommas(
                  result.totalPrice + result.craftingPrice
                )}골드 (물품비: ${StringUtil.numberWithCommas(
                  result.totalPrice
                )}골드 + 제작비: ${StringUtil.numberWithCommas(
                  result.craftingPrice
                )}골드)`}
              </Typography>
            </Stack>
            <img
              src={`/home/ec2-user/myhome/${result.name}.jpg`}
              alt='물품 사진'
            />
          </Stack>
          <Stack gap='15px'>
            {result.item.materials.map((material) => (
              <Typography key={material.name}>
                {material.name} {material.count}개
              </Typography>
            ))}
          </Stack>
        </Stack>
        <Stack>
          <Typography fontWeight={700}>기초 재료</Typography>
          <Table
            style={{
              border: "1px solid #dddddd",
              borderRadius: "10px",
              padding: "10px",
            }}
            head={[
              { key: "name", value: "재료" },
              { key: "count", value: "개수", props: { align: "right" } },
              { key: "price", value: "골드", props: { align: "right" } },
            ]}
            size='small'
          >
            {result.basic?.map((item) => (
              <TableRow
                key={item.name}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component='th' scope='row'>
                  {item.name}
                </TableCell>
                <TableCell align='right'>
                  {StringUtil.numberWithCommas(item.count)}개
                </TableCell>
                <TableCell align='right'>
                  {StringUtil.numberWithCommas(item.price)}골드
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Stack>
      </Stack>
    </div>
  );
}
