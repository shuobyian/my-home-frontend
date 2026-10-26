import { groupMaterials } from "@/domain/materialGroup";
import { MarketGroup, MarketGroupType } from "@/types/enums";

describe("groupMaterials", () => {
  it("분류 순서대로 나누고, 묶음 안은 받은 순서를 지키며, 분류가 없거나 모르는 재료는 마지막 기타로 보낸다", () => {
    const gold: { name: string; group?: MarketGroup } = { name: "금화" };
    const iron = { name: "철", group: MarketGroupType.MINERAL };
    const potato = { name: "감자", group: MarketGroupType.CROP };
    const wheat = { name: "밀", group: MarketGroupType.CROP };
    const unknown = { name: "새 재료", group: "NEW" as MarketGroup };
    const egg = { name: "달걀", group: MarketGroupType.ETC };

    expect(groupMaterials([gold, iron, potato, unknown, wheat, egg])).toEqual([
      { label: "작물", items: [potato, wheat] },
      { label: "광물", items: [iron] },
      { label: "기타", items: [gold, unknown, egg] },
    ]);
  });

  it("재료가 없으면 빈 목록", () => {
    expect(groupMaterials([])).toEqual([]);
  });
});
