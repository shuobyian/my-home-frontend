import {
  Button,
  CircularProgress,
  Stack,
  TableCell,
  TextField,
} from "@mui/material";
import { useResultQuery } from "../../queries/useResultQuery";
import { ResultDetail } from "./ResultDetail";
import { Row } from "./Row";
import { Table } from "./Table";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ResultReqParams } from "../../apis/getResults";
import { StringUtil } from "../../util/StringUtil";
import FiberNewIcon from "@mui/icons-material/FiberNew";

export function ResultList() {
  const { control, handleSubmit } = useForm<ResultReqParams>();
  const [params, setParams] = useState<ResultReqParams>({
    page: 0,
    size: 10,
    name: undefined,
    count: undefined,
  });

  const { data: results, isLoading } = useResultQuery(params);

  const onSubmit = (formData: ResultReqParams) => {
    setParams((prev) => ({ ...prev, ...formData, page: 0 }));
  };

  return (
    <>
      <Stack
        style={{
          padding: "10px",
          border: "1px solid #eeeeee",
          borderRadius: "10px",
        }}
        direction={"row"}
        gap='10px'
      >
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <TextField
              variant='outlined'
              size='small'
              placeholder='물품명 입력'
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name='count'
          control={control}
          render={({ field }) => (
            <TextField
              variant='outlined'
              type='number'
              size='small'
              placeholder='물품 개수 입력'
              value={field.value}
              onChange={field.onChange}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            />
          )}
        />
        <Button variant='contained' onClick={handleSubmit(onSubmit)}>
          검색
        </Button>
      </Stack>
      {isLoading ? (
        <CircularProgress color='inherit' />
      ) : (
        <Table
          head={[
            { key: "", value: "" },
            { key: "name", value: "물품명" },
            { key: "level", value: "레벨", props: { align: "right" } },
            {
              key: "craftingPrice",
              value: "크래프팅 가격",
              props: { align: "right" },
            },
          ]}
          pagination={{
            page: params.page,
            size: params.size,
            total: results?.totalElements ?? 0,
            onChange: (page) => setParams((prev) => ({ ...prev, page })),
          }}
        >
          {results?.content.map((result) => (
            <Row
              key={result.resultId}
              collapse={<ResultDetail result={result} />}
            >
              <TableCell component='th' scope='row'>
                {result.name} {result.isNew && <FiberNewIcon color='primary' />}
              </TableCell>
              <TableCell align='right'>{result.level}</TableCell>
              <TableCell align='right'>
                {StringUtil.numberWithCommas(result.craftingPrice)}골드
              </TableCell>
            </Row>
          ))}
        </Table>
      )}
    </>
  );
}
