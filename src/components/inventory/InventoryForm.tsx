import { SearchBar } from "@/components/common/SearchBar";
import { InventoryItem, InventoryUpdateItem } from "@/types/inventory";
import { Market } from "@/types/market";
import { Button, Field, NumberInput, Stack, Table } from "@/ui";
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

// 기초 재료마다 가진 개수를 입력하는 표. 검색으로 표를 좁혀도 입력한 값은 그대로 둔다.
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
  const formId = useId();

  const valueOf = (marketId: number) =>
    edits.has(marketId) ? edits.get(marketId) : saved.get(marketId);
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
      {/* 검색창은 따로 form이라 저장 form 밖에 두고, 저장 버튼은 form 속성으로 잇는다 */}
      <Stack justify='space-between' wrap>
        <SearchBar placeholder='재료명 입력' onSearch={setQuery} />
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
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          if (changes.length > 0) onSubmit(changes);
        }}
      >
        <Table
          rowKey={(market) => market.id}
          data={rows}
          pagination={false}
          emptyText={query ? "검색한 재료가 없습니다." : "재료가 없습니다."}
          columns={[
            { title: "재료", key: "name", render: ({ name }) => name },
            {
              title: "보유 개수",
              key: "count",
              align: "right",
              width: 200,
              render: (market) => (
                <Field
                  label={`${market.name} 보유 개수`}
                  hideLabel
                  style={{ marginBottom: 0 }}
                >
                  <NumberInput
                    suffix='개'
                    min={0}
                    precision={0}
                    placeholder='0'
                    value={valueOf(market.id) ?? null}
                    onChange={(count) =>
                      setEdits((prev) => new Map(prev).set(market.id, count))
                    }
                  />
                </Field>
              ),
            },
          ]}
        />
      </form>
    </Stack>
  );
}
