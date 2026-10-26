import { groupMaterials, MATERIAL_GROUPS } from "@/domain/materialGroup";

describe("MATERIAL_GROUPS", () => {
  it("한 재료는 한 묶음에만 들어간다", () => {
    const names = MATERIAL_GROUPS.flatMap(({ names }) => names);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("groupMaterials", () => {
  it("묶음 순서대로 나누고, 묶음 안은 받은 순서를 지키며, 모르는 재료는 마지막 기타로 보낸다", () => {
    const materials = [
      { name: "금화" },
      { name: "철" },
      { name: "감자" },
      { name: "밀" },
      { name: "흙" },
    ];
    expect(groupMaterials(materials)).toEqual([
      { label: "작물", items: [{ name: "감자" }, { name: "밀" }] },
      { label: "광물", items: [{ name: "철" }, { name: "흙" }] },
      { label: "기타", items: [{ name: "금화" }] },
    ]);
  });

  it("재료가 없으면 빈 목록", () => {
    expect(groupMaterials([])).toEqual([]);
  });
});
