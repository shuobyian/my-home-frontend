import { parseInventoryText } from "@/domain/inventory";
import { formatNumber } from "@/lib/format";
import { Market } from "@/types/market";
import { Button, Field, Modal, Text, TextArea, useToast } from "@/ui";
import { useState } from "react";

interface InventoryBulkModalProps {
  markets: Market[];
  // 읽은 개수(시세 id → 개수)로 입력칸을 채운다. 서버 저장은 호출부의 저장하기가 한다
  onApply: (counts: ReadonlyMap<number, number>) => void;
  onClose: () => void;
}

// 재료명과 개수를 한 줄씩 붙여 넣어 보유 개수 입력칸을 한꺼번에 채운다. 열 때마다 새로 마운트해서 쓴다
export function InventoryBulkModal({
  markets,
  onApply,
  onClose,
}: InventoryBulkModalProps) {
  const toast = useToast();
  const [text, setText] = useState("");
  const { counts, skipped } = parseInventoryText(text, markets);

  return (
    <Modal
      open
      title='일괄 입력'
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>취소</Button>
          <Button
            variant='primary'
            disabled={counts.size === 0}
            onClick={() => {
              onApply(counts);
              toast.success(
                `${formatNumber(counts.size)}개 재료를 채웠습니다. 저장하기를 눌러 저장해주세요.`
              );
              onClose();
            }}
          >
            {formatNumber(counts.size)}개 입력
          </Button>
        </>
      }
    >
      <Field
        label='재료명과 보유 개수'
        help='한 줄에 재료 하나씩 "재료명 개수"로 적어주세요. 엑셀에서 재료명·개수 두 칸을 복사해 붙여 넣어도 됩니다.'
      >
        <TextArea
          rows={10}
          value={text}
          onChange={setText}
          placeholder={"원목 120\n못 1,500\n천 30"}
        />
      </Field>
      {/* 줄 안에도 쉼표가 있을 수 있어 줄마다 따옴표로 감싼다 */}
      {skipped.length > 0 && (
        <Text tone='danger'>
          읽지 못한 줄 {formatNumber(skipped.length)}개(형식이 다르거나 없는
          재료): {skipped.map((line) => `"${line}"`).join(", ")}
        </Text>
      )}
    </Modal>
  );
}
