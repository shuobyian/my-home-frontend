import { Input } from "antd";

interface SearchBarProps {
  placeholder?: string;
  // 앞뒤 공백을 지운 검색어로 호출된다. 지우기 버튼을 누르면 빈 문자열(전체)로 호출된다.
  onSearch: (keyword: string) => void;
}

// 검색어 입력과 '검색' 버튼. Enter로도 검색한다.
export function SearchBar({
  placeholder = "물품명 입력",
  onSearch,
}: SearchBarProps) {
  return (
    <Input.Search
      placeholder={placeholder}
      enterButton='검색'
      allowClear
      onSearch={(value) => onSearch(value.trim())}
    />
  );
}
