import { MARKET_GROUP_LABEL, MARKET_GROUP_OPTIONS } from "@/domain/labels";
import { MarketGroup, MarketGroupType } from "@/types/enums";

// 재료를 분류(group) 순서대로 나눈다. 묶음 안은 받은 순서를 지키고, 재료가 없는 묶음은 뺀다.
// 분류가 없거나(분류가 생기기 전에 저장해 둔 시세) 이 화면이 모르는 분류인 재료는 마지막 기타로 보낸다
export function groupMaterials<T extends { group?: MarketGroup }>(
  materials: readonly T[]
): { label: string; items: T[] }[] {
  const groupOf = ({ group }: T) =>
    group && Object.hasOwn(MARKET_GROUP_LABEL, group)
      ? group
      : MarketGroupType.ETC;
  return MARKET_GROUP_OPTIONS.flatMap(({ value, label }) => {
    const items = materials.filter((material) => groupOf(material) === value);
    return items.length > 0 ? [{ label, items }] : [];
  });
}
