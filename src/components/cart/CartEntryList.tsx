import { Empty, Flex, theme, Typography } from "antd";
import { ItemImage } from "@/components/common/ItemImage";
import { CartEntry } from "@/domain/cart";
import { ReactNode } from "react";

interface CartEntryListProps {
  entries: CartEntry[];
  // 물품 이름 아래에 보여 줄 내용(출처·수량 조절 등)
  renderDescription: (entry: CartEntry) => ReactNode;
  // 담긴 물품이 없을 때 보여 줄 문구
  emptyText?: string;
}

// 장바구니 물품 목록(사진·이름·설명).
// antd 6에서 List가 폐기 예정이 되어, 목록 시맨틱(ul/li)을 지키도록 직접 그린다.
export function CartEntryList({
  entries,
  renderDescription,
  emptyText,
}: CartEntryListProps) {
  const { token } = theme.useToken();

  if (entries.length === 0) {
    return (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyText} />
    );
  }

  return (
    // list-style: none인 목록은 Safari(VoiceOver)가 목록 역할을 지우므로 role을 명시한다
    // eslint-disable-next-line jsx-a11y-x/no-redundant-roles
    <ul role='list' style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {entries.map((entry, index) => (
        <li
          key={entry.key}
          style={{
            padding: `${token.paddingSM}px 0`,
            borderBottom:
              index < entries.length - 1
                ? `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`
                : undefined,
          }}
        >
          <Flex gap='middle' align='flex-start'>
            <ItemImage name={entry.item.name} />
            <Flex vertical gap={4} flex={1} style={{ minWidth: 0 }}>
              <Typography.Text strong>{entry.item.name}</Typography.Text>
              {renderDescription(entry)}
            </Flex>
          </Flex>
        </li>
      ))}
    </ul>
  );
}
