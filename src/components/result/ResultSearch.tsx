import { Button, Form, Input, Select, Space } from "antd";
import { Panel } from "components/common/Panel";
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

  const {
    data: results,
    isFetching,
    isPreviousData,
  } = useResultsQuery({
    page: search.page,
    size: PAGE_SIZE,
    name: search.name || undefined,
    tool: search.tool,
    category: search.category,
  });

  const [form] = Form.useForm<SearchFormValues>();

  // 같은 주소로의 이동은 히스토리에 쌓지 않는다(링크 클릭과 같은 규칙)
  const navigateTo = (next: SearchState) => {
    const params = toResultSearchParams(next);
    setSearchParams(params, { replace: params.toString() === queryString });
  };

  // 뒤로 가기 등으로 검색 조건이 바뀌면 입력창도 맞춘다.
  // 페이지만 바뀔 때는 제출하지 않은 입력을 지우지 않는다.
  const { name, tool, category } = search;
  useEffect(() => {
    form.setFieldsValue(toFormValues({ name, tool, category, page: 0 }));
  }, [form, name, tool, category]);

  // 주소의 페이지가 결과 범위를 넘으면(오래된 링크 등) 마지막 페이지로 바로잡는다
  useEffect(() => {
    if (!results || isPreviousData) return;
    const lastPage = Math.max(
      0,
      Math.ceil(results.totalElements / PAGE_SIZE) - 1
    );
    if (search.page > lastPage) {
      setSearchParams(toResultSearchParams({ ...search, page: lastPage }), {
        replace: true,
      });
    }
  }, [results, isPreviousData, search, setSearchParams]);

  const submit = (values: SearchFormValues) => {
    navigateTo({
      name: values.name ?? "",
      tool: values.tool === ALL ? undefined : values.tool,
      category: values.category === ALL ? undefined : values.category,
      page: 0,
    });
  };

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Panel>
        <Form
          form={form}
          layout='inline'
          initialValues={toFormValues(search)}
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
      <ResultTable
        loading={isFetching}
        pagination={{
          page: search.page,
          size: PAGE_SIZE,
          total: results?.totalElements ?? 0,
          onChange: (page) => navigateTo({ ...search, page: page - 1 }),
        }}
        contents={results?.content ?? []}
        onRowClick={onSelect}
      />
    </Space>
  );
}
