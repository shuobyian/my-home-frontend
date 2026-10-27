import { SearchBar } from "@/components/common/SearchBar";
import { InventoryBulkModal } from "@/components/inventory/InventoryBulkModal";
import { MaterialGroups } from "@/components/common/MaterialGroups";
import { styles } from "@/components/inventory/InventoryForm.styles";
import { MUNG_UNIT } from "@/domain/result";
import { InventoryItem, InventoryUpdateItem } from "@/types/inventory";
import { Market } from "@/types/market";
import {
  Button,
  Empty,
  Field,
  MinusIcon,
  NumberInput,
  PlusIcon,
  Stack,
  Text,
} from "@/ui";
import { useId, useMemo, useState } from "react";

interface InventoryFormProps {
  // 기초 재료 목록(시세)
  markets: Market[];
  // 저장된 보유 재료. 저장에 성공해 바뀌면 입력한 값과 같아져 저장 버튼이 다시 꺼진다
  inventory: InventoryItem[];
  submitting?: boolean;
  // 저장된 값과 달라진 재료만 넘긴다. 비운 칸은 0개다
  onSubmit: (changes: InventoryUpdateItem[]) => void;
}

// 기초 재료마다 가진 개수를 입력하는 카드 목록. 재료를 얻는 곳별로 세로 열에 묶어 보여 준다.
// 검색으로 좁혀도 입력한 값은 그대로 둔다.
// 일괄 입력은 붙여 넣은 글로 입력칸만 채우고, 저장은 저장하기로 한 번에 한다
export function InventoryForm({
  markets,
  inventory,
  submitting,
  onSubmit,
}: InventoryFormProps) {
  const saved = useMemo(
    () => new Map(inventory.map(({ marketId, count }) => [marketId, count])),
    [inventory]
  );
  // 입력한 값(시세 id → 개수, 비운 칸은 null). 손대지 않은 재료는 저장된 값을 보여 준다
  const [edits, setEdits] = useState<ReadonlyMap<number, number | null>>(
    () => new Map()
  );
  const [query, setQuery] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const formId = useId();

  const valueOf = (marketId: number, from = edits) =>
    from.has(marketId) ? from.get(marketId) : saved.get(marketId);
  // −/+ 버튼: 1뭉씩 더하고 뺀다. 0 밑으로는 내려가지 않는다.
  // 빠르게 여러 번 눌러도 빠지지 않게 직전 입력값(prev)에서 센다
  const stepBy = (marketId: number, delta: number) =>
    setEdits((prev) =>
      new Map(prev).set(
        marketId,
        Math.max(0, Math.round(valueOf(marketId, prev) ?? 0) + delta)
      )
    );
  const changes = markets
    .filter(({ id }) => edits.has(id))
    // Enter로 바로 제출하면 입력칸이 값을 다듬기 전이라 여기서도 0 이상의 정수로 맞춘다
    .map(({ id }) => ({
      marketId: id,
      count: Math.max(0, Math.round(edits.get(id) ?? 0)),
    }))
    .filter(({ marketId, count }) => count !== (saved.get(marketId) ?? 0));
  const rows = query
    ? markets.filter(({ name }) => name.includes(query))
    : markets;

  return (
    <Stack vertical>
      {/* 검색창에서 Enter를 눌러도 저장되지 않게 저장 form 밖에 두고, 저장 버튼은 form 속성으로 잇는다 */}
      <Stack justify='space-between' wrap>
        <Stack wrap>
          <SearchBar placeholder='재료명 입력' onSearch={setQuery} />
          {/* 카드마다 단위 상자를 붙이면 어수선해서 한 번만 적는다 */}
          <Text tone='secondary'>단위: 개 · −/+는 1뭉({MUNG_UNIT}개)씩</Text>
        </Stack>
        <Stack>
          <Button onClick={() => setBulkOpen(true)}>일괄 입력</Button>
          <Button
            variant='primary'
            type='submit'
            form={formId}
            loading={submitting}
            disabled={changes.length === 0}
          >
            저장하기
          </Button>
        </Stack>
      </Stack>
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          if (changes.length > 0) onSubmit(changes);
        }}
      >
        {rows.length === 0 ? (
          <Empty
            description={query ? "검색한 재료가 없습니다." : "재료가 없습니다."}
          />
        ) : (
          <MaterialGroups
            items={rows}
            getKey={({ id }) => id}
            renderItem={(market) => (
              <>
                <Text strong>{market.name}</Text>
                <Field label={`${market.name} 보유 개수`} hideLabel>
                  <div css={styles.stepper}>
                    <Button
                      icon={<MinusIcon />}
                      aria-label={`${market.name} 1뭉 빼기`}
                      title={`1뭉(${MUNG_UNIT}개) 빼기`}
                      disabled={(valueOf(market.id) ?? 0) <= 0}
                      onClick={() => stepBy(market.id, -MUNG_UNIT)}
                    />
                    <NumberInput
                      style={{ flex: 1, minWidth: 0 }}
                      align='end'
                      min={0}
                      precision={0}
                      placeholder='0'
                      value={valueOf(market.id) ?? null}
                      onChange={(count) =>
                        setEdits((prev) => new Map(prev).set(market.id, count))
                      }
                    />
                    <Button
                      icon={<PlusIcon />}
                      aria-label={`${market.name} 1뭉 더하기`}
                      title={`1뭉(${MUNG_UNIT}개) 더하기`}
                      onClick={() => stepBy(market.id, MUNG_UNIT)}
                    />
                  </div>
                </Field>
              </>
            )}
          />
        )}
      </form>
      {bulkOpen && (
        <InventoryBulkModal
          markets={markets}
          onApply={(counts) =>
            setEdits((prev) => new Map([...prev, ...counts]))
          }
          onClose={() => setBulkOpen(false)}
        />
      )}
    </Stack>
  );
}
