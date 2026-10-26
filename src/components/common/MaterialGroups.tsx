import { styles } from "@/components/common/MaterialGroups.styles";
import { groupMaterials } from "@/domain/materialGroup";
import { MarketGroup } from "@/types/enums";
import { Title } from "@/ui";
import { Key, ReactNode } from "react";

interface MaterialGroupsProps<T extends { group?: MarketGroup }> {
  // group으로 묶음을 찾는다. 묶음 안은 받은 순서대로 보인다
  items: readonly T[];
  getKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
}

// 재료 카드를 얻는 곳별 묶음(세로 열)으로 나눠 보여 준다. 묶음마다 제목을 달고 접근 이름으로도 쓴다
export function MaterialGroups<T extends { group?: MarketGroup }>({
  items,
  getKey,
  renderItem,
}: MaterialGroupsProps<T>) {
  return (
    <div css={styles.columns}>
      {groupMaterials(items).map(({ label, items }) => (
        <section key={label} aria-label={label} css={styles.column}>
          <Title level={5} style={{ margin: 0 }}>
            {label}
          </Title>
          <ul css={styles.list}>
            {items.map((item) => (
              <li key={getKey(item)} css={styles.card}>
                {renderItem(item)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
