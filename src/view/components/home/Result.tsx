import {
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { ResultReqParams } from "apis/getResults";
import { ToolList } from "apis/type/Tool";
import { useResultQuery } from "queries/useResultQuery";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ResultList } from "view/components/home/ResultList";

interface ResultForm extends Omit<ResultReqParams, "tool"> {
  tool: ResultReqParams["tool"] | "ALL";
}

export function Result() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { control, handleSubmit } = useForm<ResultForm>({
    defaultValues: { tool: "ALL" },
  });
  const [params, setParams] = useState<ResultForm>({
    page: 0,
    size: 10,
    name: undefined,
    count: undefined,
    tool: "ALL",
  });

  const { data: results, isLoading } = useResultQuery({
    ...params,
    tool: params.tool === "ALL" ? undefined : params.tool,
  });

  const onSubmit = (formData: ResultForm) => {
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
        <Controller
          name='tool'
          control={control}
          render={({ field }) => (
            <Select size='small' value={field.value} onChange={field.onChange}>
              {[{ value: "ALL", label: "전체" }, ...ToolList].map(
                ({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                )
              )}
            </Select>
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
        <ResultList
          pagination={{
            page: params.page,
            size: params.size,
            total: results?.totalElements ?? 0,
            onChange: (page) => setParams((prev) => ({ ...prev, page })),
          }}
          contents={results?.content ?? []}
        />
      )}
    </>
  );
}
