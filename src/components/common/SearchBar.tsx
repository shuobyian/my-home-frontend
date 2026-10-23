import { useState } from "react";
import { Button, Input } from "@/ui";

interface SearchBarProps {
  placeholder?: string;
  // 앞뒤 공백을 지운 검색어로 호출된다. 입력창이 비면(지우기 버튼 포함) 빈 문자열(전체)로 호출된다.
  onSearch: (keyword: string) => void;
}

// 검색어 입력과 '검색' 버튼. Enter로도 검색한다.
export function SearchBar({
  placeholder = "물품명 입력",
  onSearch,
}: SearchBarProps) {
  const [keyword, setKeyword] = useState("");
  const search = () => onSearch(keyword.trim());

  return (
    <form
      role='search'
      style={{ display: "flex" }}
      onSubmit={(event) => {
        event.preventDefault();
        search();
      }}
    >
      <Input
        value={keyword}
        placeholder={placeholder}
        aria-label={placeholder}
        allowClear
        // 버튼과 이어 붙인다
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        onChange={(value) => {
          setKeyword(value);
          if (value === "") onSearch("");
        }}
        onKeyDown={(event) => {
          // 한글 조합을 끝내는 Enter는 건너뛴다. 기본 제출은 막고 버튼과 같은 검색을 부른다
          if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
          event.preventDefault();
          search();
        }}
      />
      <Button
        type='submit'
        variant='primary'
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        검색
      </Button>
    </form>
  );
}
