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

// 서버 페이지 번호는 int32 범위다
const MAX_PAGE = 2147483647;

// URL의 page(1부터)를 0부터 시작하는 번호로. 10진수 양의 정수만 받는다(1e1, 0x10 등은 무시).
function parsePage(raw: string | null) {
  if (raw === null || !/^\d+$/.test(raw)) return 0;
  const page = Number(raw) - 1;
  return page >= 0 && page <= MAX_PAGE ? page : 0;
}

// 주소에 섞인 제어 문자를 지운다
// eslint-disable-next-line no-control-regex -- 제어 문자를 찾기 위한 정규식
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;
const stripControlChars = (value: string) => value.replace(CONTROL_CHARS, "");

// 잘못된 값(없는 도구, 음수·소수 페이지, 제어 문자 등)은 무시한다
export function parseResultSearch(params: URLSearchParams): ResultSearch {
  const tool = params.get("tool");
  const category = params.get("category");

  return {
    name: stripControlChars(params.get("name") ?? "").trim(),
    tool: isTool(tool) ? tool : undefined,
    category: isCategory(category) ? category : undefined,
    page: parsePage(params.get("page")),
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
