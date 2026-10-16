import { parseResultSearch, toResultSearchParams } from "domain/resultSearch";

describe("parseResultSearch", () => {
  it("URL 쿼리를 검색 조건으로 바꾼다(page는 1부터 → 0부터)", () => {
    expect(
      parseResultSearch(
        new URLSearchParams(
          "name=%EB%82%98%EB%AC%B4&tool=WOOD&category=EVENT&page=3"
        )
      )
    ).toEqual({ name: "나무", tool: "WOOD", category: "EVENT", page: 2 });
  });

  it("쿼리가 없으면 기본값", () => {
    expect(parseResultSearch(new URLSearchParams())).toEqual({
      name: "",
      tool: undefined,
      category: undefined,
      page: 0,
    });
  });

  it.each([
    "tool=HAMMER",
    "category=SALE",
    "page=0",
    "page=-1",
    "page=1.5",
    "page=abc",
  ])("잘못된 값(%s)은 무시한다", (query) => {
    const search = parseResultSearch(new URLSearchParams(query));
    expect(search.tool).toBeUndefined();
    expect(search.category).toBeUndefined();
    expect(search.page).toBe(0);
  });
});

describe("toResultSearchParams", () => {
  it("기본값이 아닌 조건만 쓰고 page는 1부터 쓴다", () => {
    expect(
      toResultSearchParams({ name: " 나무 ", tool: "WOOD", page: 1 }).toString()
    ).toBe(new URLSearchParams("name=나무&tool=WOOD&page=2").toString());
    expect(toResultSearchParams({ name: "", page: 0 }).toString()).toBe("");
  });

  it("왕복 변환하면 같은 조건이 된다", () => {
    const search = {
      name: "의자",
      tool: "MIMI",
      category: "NORMAL",
      page: 4,
    } as const;
    expect(parseResultSearch(toResultSearchParams(search))).toEqual(search);
  });
});
