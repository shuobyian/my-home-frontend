import {
  Button,
  CircularProgress,
  Stack,
  TableCell,
  TextField,
} from "@mui/material";
import { ResultReqParams } from "apis/getResults";
import { useResultQuery } from "queries/useResultQuery";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ResultDetail } from "view/components/ResultDetail";
import { Row } from "view/components/Row";
import { Table } from "view/components/Table";

export function ResultList() {
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const keyPressEnter = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") buttonRef.current?.click();
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
              inputProps={{
                onKeyDown: (e) => keyPressEnter(e),
              }}
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
              inputProps={{
                onKeyDown: (e) => keyPressEnter(e),
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
            />
          )}
        />
        <Button
          ref={buttonRef}
          variant='contained'
          onClick={handleSubmit(onSubmit)}
        >
          검색
        </Button>
      </Stack>
      {isLoading ? (
        <CircularProgress style={{ marginTop: "20vh" }} color='inherit' />
      ) : (
        <Table
          head={[
            { key: "select", value: "" },
            { key: "name", value: "물품명" },
            { key: "level", value: "레벨", props: { align: "right" } },
          ]}
          pagination={{
            page: params.page,
            size: params.size,
            total: results?.totalElements ?? 0,
            onChange: (page) => setParams((prev) => ({ ...prev, page })),
          }}
        >
          {results?.content.map((result) => (
            <Row key={result.id} collapse={<ResultDetail result={result} />}>
              <TableCell component='th' scope='row'>
                {result.name}
              </TableCell>
              <TableCell align='right'>{result.level}</TableCell>
            </Row>
          ))}
        </Table>
      )}
    </>
  );
}
