import { Panel } from "@/components/common/Panel";
import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "@/domain/labels";
import { ResultSearchState } from "@/domain/resultSearch";
import { useState } from "react";
import { Category, Tool } from "@/types/enums";
import { Button, Input, Select, Stack, useForm } from "@/ui";

const ALL = "ALL";

// 검색 조건 중 입력창으로 고르는 부분(페이지 제외)
export type ResultSearchFilter = Omit<ResultSearchState, "page">;

interface SearchFormValues {
  name: string;
  tool: Tool | typeof ALL;
  category: Category | typeof ALL;
}

const toFormValues = ({
  name,
  tool,
  category,
}: ResultSearchFilter): SearchFormValues => ({
  name,
  tool: tool ?? ALL,
  category: category ?? ALL,
});

interface ResultSearchFormProps {
  // 현재 검색 조건. 뒤로 가기 등으로 바뀌면 입력창도 맞춘다.
  filter: ResultSearchFilter;
  onSearch: (filter: ResultSearchFilter) => void;
}

// 홈 결과 검색 입력(물품명·도구·카테고리)
export function ResultSearchForm({ filter, onSearch }: ResultSearchFormProps) {
  const { values, set, setValues, handleSubmit } = useForm(
    () => toFormValues(filter),
    () => ({})
  );

  // 검색 조건이 바뀌었을 때만 입력창을 맞춘다(페이지만 바뀔 때는 제출하지 않은 입력을 지우지 않는다).
  // 다시 마운트하면 검색 뒤 입력창·버튼의 포커스가 사라지므로 렌더 중에 값만 바꾼다.
  const { name, tool, category } = filter;
  const [synced, setSynced] = useState({ name, tool, category });
  if (
    synced.name !== name ||
    synced.tool !== tool ||
    synced.category !== category
  ) {
    setSynced({ name, tool, category });
    setValues(toFormValues({ name, tool, category }));
  }

  const submit = (values: SearchFormValues) => {
    onSearch({
      name: values.name,
      tool: values.tool === ALL ? undefined : values.tool,
      category: values.category === ALL ? undefined : values.category,
    });
  };

  return (
    <Panel>
      <form onSubmit={handleSubmit(submit)}>
        <Stack wrap gap={16} style={{ rowGap: 10 }}>
          <Input
            aria-label='물품명'
            placeholder='물품명 입력'
            allowClear
            style={{ width: 200 }}
            value={values.name}
            onChange={(value) => set("name", value)}
          />
          <Select
            aria-label='도구'
            style={{ width: "120px" }}
            value={values.tool}
            onChange={(value) => set("tool", value)}
            options={[{ value: ALL, label: "도구-전체" }, ...TOOL_OPTIONS]}
          />
          <Select
            aria-label='카테고리'
            style={{ width: "130px" }}
            value={values.category}
            onChange={(value) => set("category", value)}
            options={[
              { value: ALL, label: "카테고리-전체" },
              ...CATEGORY_OPTIONS,
            ]}
          />
          <Button variant='primary' type='submit'>
            검색
          </Button>
        </Stack>
      </form>
    </Panel>
  );
}
