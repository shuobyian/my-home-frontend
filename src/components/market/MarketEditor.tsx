import {
  diffMarketRows,
  MarketRowDiff,
  validateMarketName,
} from "@/domain/market";
import { MARKET_GROUP_OPTIONS } from "@/domain/labels";
import { formatNumber } from "@/lib/format";
import { useState } from "react";
import { MarketGroup, MarketGroupType } from "@/types/enums";
import { Market, MarketUpdateItem } from "@/types/market";
import {
  Button,
  DeleteIcon,
  Empty,
  Field,
  FormErrors,
  Input,
  NumberInput,
  Select,
  Stack,
  Text,
  useForm,
} from "@/ui";
import { MaterialGroups } from "@/components/common/MaterialGroups";

interface EditorRow {
  // 표의 행 key: 저장된 행은 id:<id>, 새 행은 new:<n>
  key: string;
  id?: number;
  // 칸의 접근 이름에 쓴다(저장된 행은 서버 이름, 새 행은 '새 재료 n'). 이름을 고쳐도 바뀌지 않는다
  label: string;
  name: string;
  // 비운 시세 칸은 null
  price: number | null;
  // 고르지 않은 새 행은 없다(서버 기본값인 기타로 저장된다)
  group?: MarketGroup;
}

const toRows = (markets: readonly Market[]): EditorRow[] =>
  markets.map(({ id, name, price, group }) => ({
    key: `id:${id}`,
    id,
    label: name,
    name,
    price,
    group,
  }));

function validate({ rows }: { rows: EditorRow[] }): FormErrors {
  const errors: FormErrors = {};
  rows.forEach((row, index) => {
    // 같은 표의 다른 행과 이름이 겹치면 안 된다(서버 이름은 unique)
    const otherNames = new Set(
      rows.filter((_, i) => i !== index).map(({ name }) => name.trim())
    );
    errors[`rows.${index}.name`] = validateMarketName(row.name, otherNames);
    errors[`rows.${index}.price`] =
      row.price == null ? "시세를 입력해주세요" : undefined;
  });
  return errors;
}

// 카드 칸의 라벨. 화면에는 칸 이름만 보이고, 카드마다 겹치지 않도록 접근 이름 앞에는 재료 이름을 붙인다
const cardLabel = (row: EditorRow, name: string) => (
  <>
    <span className='ui-sr-only'>{row.label} </span>
    {name}
  </>
);

interface MarketEditorProps {
  // 서버 시세. 도착하면 한 번만 표를 채운다(이후 재조회가 입력 중인 값을 덮어쓰지 않도록).
  // 캐시에 남은 오래된 값으로 채우지 않도록 마운트 후 새로 받은 값만 넘긴다(isFetchedAfterMount)
  markets?: Market[];
  // 시세 이름 → 그 시세를 쓰는 물품 이름. 없으면 사용처를 모르는 것으로 보고 삭제를 막는다
  usage?: ReadonlyMap<string, string[]>;
  submitting?: boolean;
  // changes: PUT /market 본문(바뀐 것만), renames: 이름을 바꾼 기존 시세
  onSubmit: (
    changes: MarketUpdateItem[],
    renames: MarketRowDiff["renames"]
  ) => void;
  // 저장된 시세의 삭제 요청. 쓰는 물품이 없는 시세만 부른다
  onDelete: (market: Market) => void;
}

// 관리자 시세 편집 카드 목록: 이름·시세·분류 수정, 새 재료 추가, 쓰지 않는 시세 삭제.
// 저장된 분류(얻는 곳)별 묶음으로 나눠 보여 준다
export function MarketEditor({
  markets,
  usage,
  submitting,
  onSubmit,
  onDelete,
}: MarketEditorProps) {
  const { values, errors, setValues, handleSubmit } = useForm<{
    rows: EditorRow[];
  }>(() => ({ rows: toRows(markets ?? []) }), validate);
  const { rows } = values;
  const [newCount, setNewCount] = useState(0);

  // 서버 시세가 처음 도착하면 한 번만 채운다. 그 뒤로 서버에서 사라진 시세(삭제)는 표에서도 뺀다
  const [filled, setFilled] = useState(!!markets);
  const [prevMarkets, setPrevMarkets] = useState(markets);
  if (markets !== prevMarkets) {
    setPrevMarkets(markets);
    if (markets && !filled) {
      setFilled(true);
      setValues({ rows: toRows(markets) });
    } else if (markets) {
      const ids = new Set(markets.map(({ id }) => id));
      setValues((prev) => ({
        rows: prev.rows.filter(({ id }) => id === undefined || ids.has(id)),
      }));
    }
  }

  const byId = new Map(markets?.map((market) => [market.id, market]));
  const { changes } = diffMarketRows(markets ?? [], rows);

  const setRow = (key: string, patch: Partial<EditorRow>) =>
    setValues((prev) => ({
      rows: prev.rows.map((row) =>
        row.key === key ? { ...row, ...patch } : row
      ),
    }));

  const addRow = () => {
    const n = newCount + 1;
    setNewCount(n);
    setValues((prev) => ({
      rows: [
        ...prev.rows,
        { key: `new:${n}`, label: `새 재료 ${n}`, name: "", price: null },
      ],
    }));
  };

  const removeNewRow = (key: string) =>
    setValues((prev) => ({ rows: prev.rows.filter((row) => row.key !== key) }));

  return (
    <form
      onSubmit={handleSubmit(({ rows }) => {
        const diff = diffMarketRows(markets ?? [], rows);
        onSubmit(diff.changes, diff.renames);
      })}
    >
      <Stack justify='space-between' wrap style={{ marginBottom: 10 }}>
        <Stack>
          <Button onClick={addRow}>재료 추가</Button>
          <Button
            onClick={() => {
              if (markets) setValues({ rows: toRows(markets) });
            }}
            disabled={!markets}
          >
            시세 불러오기
          </Button>
          {/* 카드마다 단위 상자를 붙이면 어수선해서 한 번만 적는다 */}
          <Text tone='secondary'>단위: 골드</Text>
        </Stack>
        <Button
          variant='primary'
          type='submit'
          loading={submitting}
          disabled={!markets || changes.length === 0}
        >
          저장
        </Button>
      </Stack>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <MaterialGroups
          // 분류를 고르는 중에 카드가 다른 묶음으로 옮겨 가지 않도록 서버에 저장된 분류로 묶는다(저장하면 다시 묶인다).
          // 새 행은 기타로 간다. index는 오류 경로(rows.<index>.*)에 쓴다
          items={rows.map((row, index) => ({
            group: row.id === undefined ? undefined : byId.get(row.id)?.group,
            row,
            index,
          }))}
          getKey={({ row }) => row.key}
          renderItem={({ row, index }) => {
            const market = row.id === undefined ? undefined : byId.get(row.id);
            // 저장된 행이 쓰는 물품. 새 행이거나 사용처를 모르면 undefined
            const products = market && usage?.get(market.name);
            return (
              <>
                <Field
                  label={cardLabel(row, "이름")}
                  inline
                  required
                  error={errors[`rows.${index}.name`]}
                >
                  <Input
                    value={row.name}
                    onChange={(name) => setRow(row.key, { name })}
                    placeholder='재료 이름'
                  />
                </Field>
                <Field
                  label={cardLabel(row, "시세")}
                  inline
                  required
                  error={errors[`rows.${index}.price`]}
                >
                  <NumberInput
                    min={0}
                    precision={0}
                    value={row.price}
                    onChange={(price) => setRow(row.key, { price })}
                  />
                </Field>
                <Field label={cardLabel(row, "분류")} inline>
                  <Select
                    value={row.group ?? MarketGroupType.ETC}
                    onChange={(group) => setRow(row.key, { group })}
                    options={MARKET_GROUP_OPTIONS}
                  />
                </Field>
                <Stack justify='space-between' wrap>
                  <Text tone='secondary'>
                    사용 물품{" "}
                    <span title={products?.join(", ")}>
                      {products ? `${formatNumber(products.length)}개` : "-"}
                    </span>
                  </Text>
                  {/* 새 행은 바로 뺀다. 저장된 행은 쓰는 물품이 있거나 사용처를 모르면 지울 수 없다(서버도 거절한다) */}
                  <Button
                    danger
                    icon={<DeleteIcon />}
                    aria-label={`${row.label} 삭제`}
                    disabled={!!market && (!products || products.length > 0)}
                    onClick={() =>
                      market ? onDelete(market) : removeNewRow(row.key)
                    }
                  />
                </Stack>
              </>
            );
          }}
        />
      )}
    </form>
  );
}
