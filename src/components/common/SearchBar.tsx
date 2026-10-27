import { DebounceInput } from "@/components/common/DebounceInput";

interface SearchBarProps {
  placeholder?: string;
  // 입력을 멈추면 앞뒤 공백을 지운 검색어로 호출된다. 입력창을 비우면 빈 문자열(전체)로 호출된다.
  onSearch: (keyword: string) => void;
}

// 검색어 입력. 버튼 없이 입력을 멈추면 바로 검색한다.
export function SearchBar({
  placeholder = "물품명 입력",
  onSearch,
}: SearchBarProps) {
  return (
    <div role='search'>
      <DebounceInput
        placeholder={placeholder}
        aria-label={placeholder}
        allowClear
        onChange={(keyword) => onSearch(keyword.trim())}
      />
    </div>
  );
}
