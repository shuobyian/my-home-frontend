import { Button, Form, Input, Select, Space } from "antd";
import { ResultTable } from "components/result/ResultTable";
import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "domain/labels";
import {
  parseResultSearch,
  ResultSearch as SearchState,
  toResultSearchParams,
} from "domain/resultSearch";
import { useResultsQuery } from "queries/result";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Category, Tool } from "types/enums";
import { Result } from "types/result";

const PAGE_SIZE = 10;
const ALL = "ALL";

interface SearchFormValues {
  name: string;
  tool: Tool | typeof ALL;
  category: Category | typeof ALL;
}

const toFormValues = ({
  name,
  tool,
  category,
}: SearchState): SearchFormValues => ({
  name,
  tool: tool ?? ALL,
  category: category ?? ALL,
});

interface ResultSearchProps {
  // 결과 행을 누르면 호출된다
  onSelect?: (result: Result) => void;
}

// 홈 결과 검색. 검색 조건과 페이지는 URL에 두어 뒤로 가기·새로고침·공유 시에도 유지한다.
export function ResultSearch({ onSelect }: ResultSearchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const search = useMemo(
    () => parseResultSearch(new URLSearchParams(queryString)),
    [queryString]
  );

  const { data: results, isFetching } = useResultsQuery({
    page: search.page,
    size: PAGE_SIZE,
    name: search.name || undefined,
    tool: search.tool,
    category: search.category,
  });

  const [form] = Form.useForm<SearchFormValues>();

  // 뒤로 가기 등으로 URL이 바뀌면 입력창도 맞춘다
  useEffect(() => {
    form.setFieldsValue(toFormValues(search));
  }, [form, search]);

  const submit = ({ name, tool, category }: SearchFormValues) => {
    setSearchParams(
      toResultSearchParams({
        name: name ?? "",
        tool: tool === ALL ? undefined : tool,
        category: category === ALL ? undefined : category,
        page: 0,
      })
    );
  };

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Form
        form={form}
        layout='inline'
        initialValues={toFormValues(search)}
        onFinish={submit}
        style={{
          padding: "10px",
          border: "1px solid #eeeeee",
          borderRadius: "10px",
          rowGap: "10px",
        }}
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
      <ResultTable
        loading={isFetching}
        pagination={{
          page: search.page,
          size: PAGE_SIZE,
          total: results?.totalElements ?? 0,
          onChange: (page) =>
            setSearchParams(
              toResultSearchParams({ ...search, page: page - 1 })
            ),
        }}
        contents={results?.content ?? []}
        onRowClick={onSelect}
      />
    </Space>
  );
}
