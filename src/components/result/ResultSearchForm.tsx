import { DebounceInput } from "@/components/common/DebounceInput";
import { Panel } from "@/components/common/Panel";
import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "@/domain/labels";
import { ResultSearchState } from "@/domain/resultSearch";
import { useState } from "react";
import { Select, Stack } from "@/ui";

const ALL = "ALL";

interface ResultSearchFormProps {
  // 현재 검색 조건. 뒤로 가기 등으로 바뀌면 입력창도 맞춘다.
  filter: ResultSearchState;
  onSearch: (filter: ResultSearchState) => void;
  // 검색 결과를 받는 중(물품명 입력창에 로딩 표시)
  loading?: boolean;
}

// 홈 결과 검색 입력(물품명·도구·카테고리). 도구·카테고리는 고르면 바로, 물품명은 입력을 멈추면 검색한다.
export function ResultSearchForm({
  filter,
  onSearch,
  loading,
}: ResultSearchFormProps) {
  // 주소는 이름의 앞뒤 공백을 지우므로, 공백만 다르면 입력한 글자를 그대로 보인다(입력 중 친 공백이 사라지지 않게)
  const [typed, setTyped] = useState(filter.name);
  const name = typed.trim() === filter.name ? typed : filter.name;

  return (
    <Panel>
      <Stack role='search' wrap gap={16} style={{ rowGap: 10 }}>
        <DebounceInput
          aria-label='물품명'
          placeholder='물품명 입력'
          allowClear
          style={{ width: 200 }}
          loading={loading}
          value={name}
          onChange={(value) => {
            setTyped(value);
            onSearch({ ...filter, name: value });
          }}
        />
        <Select
          aria-label='도구'
          style={{ width: "120px" }}
          value={filter.tool ?? ALL}
          onChange={(value) =>
            onSearch({ ...filter, tool: value === ALL ? undefined : value })
          }
          options={[{ value: ALL, label: "도구-전체" }, ...TOOL_OPTIONS]}
        />
        <Select
          aria-label='카테고리'
          style={{ width: "130px" }}
          value={filter.category ?? ALL}
          onChange={(value) =>
            onSearch({
              ...filter,
              category: value === ALL ? undefined : value,
            })
          }
          options={[
            { value: ALL, label: "카테고리-전체" },
            ...CATEGORY_OPTIONS,
          ]}
        />
      </Stack>
    </Panel>
  );
}
