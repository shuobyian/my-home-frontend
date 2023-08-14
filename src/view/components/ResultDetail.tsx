import { Stack, TableCell, TableRow, Typography } from "@mui/material";
import { Result } from "apis/getResults";
import { StringUtil } from "util/StringUtil";
import { InfoRow } from "view/components/InfoRow";
import { Table } from "view/components/Table";

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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Stack gap='15px'>
            <InfoRow title='물품명' value={result.name} />
            <InfoRow
              title={
                result.name.includes("미미") ? "필요 미미 호감도" : "필요 레벨"
              }
              value={`Lv.${result.level} 이상`}
            />
            <InfoRow
              title='필요 금액'
              value={`${StringUtil.numberWithCommas(
                result.totalPrice + result.craftingPrice
              )}골드 (물품비: ${StringUtil.numberWithCommas(
                result.totalPrice
              )}골드 + 제작비: ${StringUtil.numberWithCommas(
                result.craftingPrice
              )}골드)`}
            />
            <img
              src={`${process.env.PUBLIC_URL}/images/${result.name}.jpg`}
              width='300'
              alt='물품 사진'
            />
          </Stack>
          <Stack gap='10px'>
            {result.item.materials.map((material) => (
              <Typography key={material.name}>
                {material.name} {material.count}개
              </Typography>
            ))}
          </Stack>
        </div>
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
