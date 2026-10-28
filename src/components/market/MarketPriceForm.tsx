import { useEffect, useEffectEvent, useState } from "react";
import {
  findNewMarkets,
  mergeMarkets,
  renameByServerId,
} from "@/domain/market";
import { Market } from "@/types/market";
import { Button, Empty, Field, NumberInput, Stack, Text, useForm } from "@/ui";
import { MaterialGroups } from "@/components/common/MaterialGroups";

// 비운 시세 칸은 null로 둔다
type MarketRow = Omit<Market, "price"> & { price: number | null };

interface MarketPriceFormProps {
  // 서버 시세. '시세 불러오기'와, 초기값이 없을 때 처음 채우는 데 쓴다.
  // 캐시에 남은 오래된 값으로 채우지 않도록 마운트 후 새로 받은 값만 넘긴다(isFetchedAfterMount)
  serverMarkets?: Market[];
  // 처음 채울 값(예: 브라우저에 저장해 둔 시세). 있으면 서버 시세보다 우선한다.
  // 서버 시세가 도착하면 이 값에 없는 이름의 재료만 표 끝에 덧붙인다(입력값은 그대로 둔다)
  initialMarkets?: Market[];
  // 서버에만 있어 표에 덧붙인 재료를 알린다
  onMarketsAdded?: (added: Market[]) => void;
  submitText: string;
  submitting?: boolean;
  onSubmit: (markets: Market[]) => void;
}

// 재료 시세 입력 카드 목록(시세 조작 모드). 얻는 곳별 묶음으로 나눠 보여 준다.
// 서버 시세를 고치는 관리 화면은 MarketEditor를 쓴다
export function MarketPriceForm({
  serverMarkets,
  initialMarkets,
  onMarketsAdded,
  submitText,
  submitting,
  onSubmit,
}: MarketPriceFormProps) {
  const source = initialMarkets ?? serverMarkets;
  // 비운 칸도 그대로 넘기므로 검증할 것이 없다
  const { values, setValues, handleSubmit } = useForm<{
    markets: MarketRow[];
  }>(
    () => ({ markets: source ?? [] }),
    () => ({})
  );

  // 처음 값이 준비되면 한 번만 채운다(이후 재조회가 입력 중인 값을 덮어쓰지 않도록).
  // 값은 보통 마운트 뒤에 도착하고, 호출부가 key를 넘기지 않아도 되도록 렌더 중에 채운다.
  const [filled, setFilled] = useState(!!source);
  if (!filled && source) {
    setFilled(true);
    setValues({ markets: source });
  }

  // 저장해 둔 값으로 시작한 표는 서버 시세가 도착했을 때 한 번만 서버에 맞춘다.
  // 이름이 바뀐 재료(같은 id)는 입력값을 지킨 채 새 이름으로 바꾸고, 새 재료는 끝에 덧붙인다.
  // 서버 값으로 시작했거나 이미 맞췄다면 하지 않는다(이후 재조회도 입력 중인 값을 건드리지 않는다)
  const [merged, setMerged] = useState(!initialMarkets);
  const [added, setAdded] = useState<Market[]>([]);
  if (!merged && serverMarkets) {
    setMerged(true);
    const renamed = renameByServerId(values.markets, serverMarkets);
    const newMarkets = findNewMarkets(renamed, serverMarkets);
    if (renamed !== values.markets || newMarkets.length > 0) {
      setValues(({ markets }) => ({
        markets: mergeMarkets(markets, serverMarkets),
      }));
    }
    if (newMarkets.length > 0) setAdded(newMarkets);
  }

  const notifyAdded = useEffectEvent((markets: Market[]) =>
    onMarketsAdded?.(markets)
  );
  useEffect(() => {
    if (added.length > 0) notifyAdded(added);
  }, [added]);

  // 묶음으로 나눠 보여 순서가 바뀌므로 id로 찾는다
  const setPrice = (id: number, price: number | null) =>
    setValues(({ markets }) => ({
      markets: markets.map((market) =>
        market.id === id ? { ...market, price } : market
      ),
    }));

  // 분류는 서버 시세(같은 id)를 따른다. 저장해 둔 시세에는 분류가 없거나 그 뒤 관리자가 바꿨을 수 있다.
  // 서버 시세가 오기 전에는 저장해 둔 분류로 보인다. 이전에 저장된 문자열 id도 숫자로 맞춰 본다
  const serverGroups = new Map(
    serverMarkets?.map(({ id, group }) => [id, group])
  );
  const withServerGroup = <T extends MarketRow>(market: T): T => ({
    ...market,
    group: serverGroups.get(Number(market.id)) ?? market.group,
  });

  return (
    <form
      onSubmit={handleSubmit(({ markets }) =>
        // 입력칸이 있는 값만 넘긴다. 빈 시세(null)도 그대로 넘긴다(parseMarketList가 받는다).
        // 분류도 함께 넘겨 다음에 저장본으로 시작할 때 서버 시세가 오기 전에도 묶음이 보이게 한다
        onSubmit(
          markets.map(withServerGroup).map(({ id, name, price, group }) => ({
            id,
            name,
            // ponytail: 비운 칸에서 넘어가는 null을 이 단언이 가린다.
            // Market.price를 number | null로 넓히고 서버 계약(계산 요청이 null 시세를 받는지)을 확인한 뒤 없앤다
            price: price as number,
            group,
          }))
        )
      )}
    >
      <Stack justify='space-between' style={{ marginBottom: 10 }}>
        <Stack>
          <Button
            onClick={() => {
              if (serverMarkets) setValues({ markets: serverMarkets });
            }}
            disabled={!serverMarkets}
          >
            시세 불러오기
          </Button>
          {/* 카드마다 단위 상자를 붙이면 어수선해서 한 번만 적는다 */}
          <Text tone='secondary'>단위: 골드</Text>
        </Stack>
        <Button variant='primary' type='submit' loading={submitting}>
          {submitText}
        </Button>
      </Stack>
      {values.markets.length === 0 ? (
        <Empty />
      ) : (
        <MaterialGroups
          items={values.markets.map(withServerGroup)}
          getKey={({ id }) => id}
          renderItem={(market) => (
            <>
              <Text strong>{market.name}</Text>
              <Field label={`${market.name} 시세`} hideLabel>
                <NumberInput
                  min={0}
                  value={market.price}
                  onChange={(price) => setPrice(market.id, price)}
                />
              </Field>
            </>
          )}
        />
      )}
    </form>
  );
}
