import { Category, CategoryType, Tool, ToolType } from "types/enums";

// 홈 결과 검색 조건. URL 쿼리(?name=&tool=&category=&page=)와 서로 변환한다.
export interface ResultSearch {
  name: string;
  tool?: Tool;
  category?: Category;
  // 0부터 시작(서버와 같음). URL에는 사람이 읽기 쉽게 1부터 쓴다.
  page: number;
}

const TOOLS: string[] = Object.values(ToolType);
const CATEGORIES: string[] = Object.values(CategoryType);

const isTool = (value: string | null): value is Tool =>
  value !== null && TOOLS.includes(value);
const isCategory = (value: string | null): value is Category =>
  value !== null && CATEGORIES.includes(value);

// 잘못된 값(없는 도구, 음수·소수 페이지 등)은 무시한다
export function parseResultSearch(params: URLSearchParams): ResultSearch {
  const tool = params.get("tool");
  const category = params.get("category");
  const page = Number(params.get("page"));

  return {
    name: params.get("name")?.trim() ?? "",
    tool: isTool(tool) ? tool : undefined,
    category: isCategory(category) ? category : undefined,
    page: Number.isInteger(page) && page >= 1 ? page - 1 : 0,
  };
}

// 기본값(빈 이름, 전체, 첫 페이지)은 URL에 쓰지 않는다
export function toResultSearchParams(search: ResultSearch): URLSearchParams {
  const params = new URLSearchParams();
  const name = search.name.trim();
  if (name) params.set("name", name);
  if (search.tool) params.set("tool", search.tool);
  if (search.category) params.set("category", search.category);
  if (search.page > 0) params.set("page", String(search.page + 1));
  return params;
}
