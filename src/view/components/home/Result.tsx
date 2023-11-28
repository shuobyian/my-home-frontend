import { Button, Input, InputNumber, Select, Space } from "antd";
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
    <Space direction='vertical' style={{ width: "100%" }}>
      <Space
        style={{
          padding: "10px",
          border: "1px solid #eeeeee",
          borderRadius: "10px",
          gap: "10px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <Controller
          name='name'
          control={control}
          render={({ field }) => (
            <Input
              placeholder='물품명 입력'
              value={field.value}
              onChange={field.onChange}
              onPressEnter={keyPressEnter}
            />
          )}
        />
        <Controller
          name='count'
          control={control}
          render={({ field }) => (
            <InputNumber
              type='number'
              style={{ width: "120px" }}
              placeholder='물품 개수 입력'
              value={field.value}
              onChange={field.onChange}
              onPressEnter={keyPressEnter}
              pattern='[0-9]*'
            />
          )}
        />
        <Controller
          name='tool'
          control={control}
          render={({ field }) => (
            <Select
              style={{ width: "120px" }}
              value={field.value}
              onChange={field.onChange}
              options={[{ value: "ALL", label: "전체" }, ...ToolList]}
            />
          )}
        />
        <Button type='primary' ref={buttonRef} onClick={handleSubmit(onSubmit)}>
          검색
        </Button>
      </Space>
      <ResultList
        loading={isLoading}
        pagination={{
          page: params.page,
          size: params.size,
          total: results?.totalElements ?? 0,
          onChange: (page) =>
            setParams((prev) => ({ ...prev, page: page - 1 })),
        }}
        contents={results?.content ?? []}
      />
    </Space>
  );
}
