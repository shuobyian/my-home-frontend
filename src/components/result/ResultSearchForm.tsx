import { Button, Form, Input, Select } from "antd";
import { Panel } from "@/components/common/Panel";
import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "@/domain/labels";
import { ResultSearchState } from "@/domain/resultSearch";
import { useEffect } from "react";
import { Category, Tool } from "@/types/enums";

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
  const [form] = Form.useForm<SearchFormValues>();

  // 검색 조건이 바뀌었을 때만 입력창을 맞춘다(페이지만 바뀔 때는 제출하지 않은 입력을 지우지 않는다)
  const { name, tool, category } = filter;
  useEffect(() => {
    form.setFieldsValue(toFormValues({ name, tool, category }));
  }, [form, name, tool, category]);

  const submit = (values: SearchFormValues) => {
    onSearch({
      name: values.name ?? "",
      tool: values.tool === ALL ? undefined : values.tool,
      category: values.category === ALL ? undefined : values.category,
    });
  };

  return (
    <Panel>
      <Form
        form={form}
        layout='inline'
        initialValues={toFormValues(filter)}
        onFinish={submit}
        style={{ rowGap: 10 }}
      >
        <Form.Item name='name'>
          <Input placeholder='물품명 입력' allowClear />
        </Form.Item>
        <Form.Item name='tool'>
          <Select
            style={{ width: "120px" }}
            options={[{ value: ALL, label: "도구-전체" }, ...TOOL_OPTIONS]}
          />
        </Form.Item>
        <Form.Item name='category'>
          <Select
            style={{ width: "130px" }}
            options={[
              { value: ALL, label: "카테고리-전체" },
              ...CATEGORY_OPTIONS,
            ]}
          />
        </Form.Item>
        <Button type='primary' htmlType='submit'>
          검색
        </Button>
      </Form>
    </Panel>
  );
}
