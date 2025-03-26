import { Button, Input, InputNumber, Select, Space } from "antd";
import { ResultReqParams } from "apis/result/getResults";
import { CategoryList } from "apis/type/Category";
import { ToolList } from "apis/type/Tool";
import { useResultQuery } from "queries/result/useResultQuery";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ResultList } from "view/components/home/ResultList";

interface ResultForm extends Omit<ResultReqParams, "tool" | "category"> {
  tool: ResultReqParams["tool"] | "ALL";
  category: ResultReqParams["category"] | "ALL";
}

export function Result() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { control, handleSubmit } = useForm<ResultForm>({
    defaultValues: { tool: "ALL", category: "ALL" },
  });
  const [params, setParams] = useState<ResultForm>({
    page: 0,
    size: 10,
    name: undefined,
    tool: "ALL",
    category: "ALL",
  });

  const { data: results, isLoading } = useResultQuery({
    ...params,
    tool: params.tool === "ALL" ? undefined : params.tool,
    category: params.category === "ALL" ? undefined : params.category,
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
          name='tool'
          control={control}
          render={({ field }) => (
            <Select
              style={{ width: "120px" }}
              value={field.value}
              onChange={field.onChange}
              options={[{ value: "ALL", label: "도구-전체" }, ...ToolList]}
            />
          )}
        />
        <Controller
          name='category'
          control={control}
          render={({ field }) => (
            <Select
              style={{ width: "130px" }}
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: "ALL", label: "카테고리-전체" },
                ...CategoryList,
              ]}
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
