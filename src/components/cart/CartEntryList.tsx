import { ItemImage } from "@/components/common/ItemImage";
import { CartEntry } from "@/domain/cart";
import { ReactNode } from "react";
import { Empty, Stack, Text } from "@/ui";

interface CartEntryListProps {
  entries: CartEntry[];
  // 물품 이름 아래에 보여 줄 내용(출처·수량 조절 등)
  renderDescription: (entry: CartEntry) => ReactNode;
  // 담긴 물품이 없을 때 보여 줄 문구
  emptyText?: string;
}

// 장바구니 물품 목록(사진·이름·설명). 목록 시맨틱(ul/li)을 지키도록 직접 그린다.
export function CartEntryList({
  entries,
  renderDescription,
  emptyText,
}: CartEntryListProps) {
  if (entries.length === 0) {
    return <Empty description={emptyText} />;
  }

  return (
    // list-style: none인 목록은 Safari(VoiceOver)가 목록 역할을 지우므로 role을 명시한다
    // eslint-disable-next-line jsx-a11y-x/no-redundant-roles
    <ul role='list' style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {entries.map((entry, index) => (
        <li
          key={entry.key}
          style={{
            padding: "var(--ui-space-3) 0",
            borderBottom:
              index < entries.length - 1
                ? "1px solid var(--ui-color-border-secondary)"
                : undefined,
          }}
        >
          <Stack gap={16} align='flex-start'>
            <ItemImage name={entry.item.name} />
            <Stack vertical gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text strong>{entry.item.name}</Text>
              {renderDescription(entry)}
            </Stack>
          </Stack>
        </li>
      ))}
    </ul>
  );
}
