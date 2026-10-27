import { Category, CategoryType, Tool, ToolType } from "@/types/enums";

// 홈 결과 검색 조건. URL 쿼리(?name=&tool=&category=)와 서로 변환한다.
export interface ResultSearchState {
  name: string;
  tool?: Tool;
  category?: Category;
}

const TOOLS: string[] = Object.values(ToolType);
const CATEGORIES: string[] = Object.values(CategoryType);

const isTool = (value: string | null): value is Tool =>
  value !== null && TOOLS.includes(value);
const isCategory = (value: string | null): value is Category =>
  value !== null && CATEGORIES.includes(value);

// 주소에 섞인 제어 문자를 지운다
// eslint-disable-next-line no-control-regex -- 제어 문자를 찾기 위한 정규식
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const stripControlChars = (value: string) => value.replace(CONTROL_CHARS, "");

// 잘못된 값(없는 도구, 제어 문자 등)은 무시한다
export function parseResultSearch(params: URLSearchParams): ResultSearchState {
  const tool = params.get("tool");
  const category = params.get("category");

  return {
    name: stripControlChars(params.get("name") ?? "").trim(),
    tool: isTool(tool) ? tool : undefined,
    category: isCategory(category) ? category : undefined,
  };
}

// 기본값(빈 이름, 전체)은 URL에 쓰지 않는다
export function toResultSearchParams(
  search: ResultSearchState
): URLSearchParams {
  const params = new URLSearchParams();
  const name = search.name.trim();
  if (name) params.set("name", name);
  if (search.tool) params.set("tool", search.tool);
  if (search.category) params.set("category", search.category);
  return params;
}
