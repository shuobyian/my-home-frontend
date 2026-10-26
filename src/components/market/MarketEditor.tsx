import {
  diffMarketRows,
  MarketRowDiff,
  validateMarketName,
} from "@/domain/market";
import { formatNumber } from "@/lib/format";
import { useState } from "react";
import { Market, MarketUpdateItem } from "@/types/market";
import {
  Button,
  DeleteIcon,
  Empty,
  Field,
  FormErrors,
  Input,
  NumberInput,
  Stack,
  Text,
  useForm,
} from "@/ui";
import { styles } from "./MarketCards.styles";

interface EditorRow {
  // 표의 행 key: 저장된 행은 id:<id>, 새 행은 new:<n>
  key: string;
  id?: number;
  // 칸의 접근 이름에 쓴다(저장된 행은 서버 이름, 새 행은 '새 재료 n'). 이름을 고쳐도 바뀌지 않는다
  label: string;
  name: string;
  // 비운 시세 칸은 null
  price: number | null;
}

const toRows = (markets: readonly Market[]): EditorRow[] =>
  markets.map(({ id, name, price }) => ({
    key: `id:${id}`,
    id,
    label: name,
    name,
    price,
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

const CARD_FIELD_STYLE = { marginBottom: 0 };

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

// 관리자 시세 편집 카드 목록: 이름·시세 수정, 새 재료 추가, 쓰지 않는 시세 삭제
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
        <ul css={styles.grid}>
          {rows.map((row, index) => {
            const market = row.id === undefined ? undefined : byId.get(row.id);
            // 저장된 행이 쓰는 물품. 새 행이거나 사용처를 모르면 undefined
            const products = market && usage?.get(market.name);
            return (
              <li key={row.key} css={styles.card}>
                <Field
                  label={`${row.label} 이름`}
                  hideLabel
                  required
                  error={errors[`rows.${index}.name`]}
                  style={CARD_FIELD_STYLE}
                >
                  <Input
                    value={row.name}
                    onChange={(name) => setRow(row.key, { name })}
                    placeholder='재료 이름'
                  />
                </Field>
                <Field
                  label={`${row.label} 시세`}
                  hideLabel
                  required
                  error={errors[`rows.${index}.price`]}
                  style={CARD_FIELD_STYLE}
                >
                  <NumberInput
                    style={{ width: "100%" }}
                    min={0}
                    precision={0}
                    value={row.price}
                    onChange={(price) => setRow(row.key, { price })}
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
              </li>
            );
          })}
        </ul>
      )}
    </form>
  );
}
