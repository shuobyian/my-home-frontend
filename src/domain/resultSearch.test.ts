import { parseResultSearch, toResultSearchParams } from "@/domain/resultSearch";

describe("parseResultSearch", () => {
  it("URL 쿼리를 검색 조건으로 바꾼다", () => {
    expect(
      parseResultSearch(
        new URLSearchParams("name=%EB%82%98%EB%AC%B4&tool=WOOD&category=EVENT")
      )
    ).toEqual({ name: "나무", tool: "WOOD", category: "EVENT" });
  });

  it("쿼리가 없으면 기본값", () => {
    expect(parseResultSearch(new URLSearchParams())).toEqual({
      name: "",
      tool: undefined,
      category: undefined,
    });
  });

  it.each(["tool=HAMMER", "category=SALE"])(
    "잘못된 값(%s)은 무시한다",
    (query) => {
      const search = parseResultSearch(new URLSearchParams(query));
      expect(search.tool).toBeUndefined();
      expect(search.category).toBeUndefined();
    }
  );
});

describe("parseResultSearch - 일부만 잘못된 경우", () => {
  it("잘못된 값만 버리고 나머지 조건은 살린다", () => {
    expect(
      parseResultSearch(new URLSearchParams("tool=HAMMER&category=EVENT"))
    ).toEqual({
      name: "",
      tool: undefined,
      category: "EVENT",
    });
  });

  it("이름의 제어 문자를 지운다", () => {
    expect(
      parseResultSearch(new URLSearchParams("name=%EB%82%98%00%EB%AC%B4")).name
    ).toBe("나무");
  });
});

describe("toResultSearchParams", () => {
  it("기본값이 아닌 조건만 쓴다", () => {
    expect(
      toResultSearchParams({ name: " 나무 ", tool: "WOOD" }).toString()
    ).toBe(new URLSearchParams("name=나무&tool=WOOD").toString());
    expect(toResultSearchParams({ name: "" }).toString()).toBe("");
  });

  it("왕복 변환하면 같은 조건이 된다", () => {
    const search = {
      name: "의자",
      tool: "MIMI",
      category: "NORMAL",
    } as const;
    expect(parseResultSearch(toResultSearchParams(search))).toEqual(search);
  });
});
