import { useState } from "react";
import { Market } from "@/types/market";
import { Button, Field, Input, NumberInput, Stack, Table, useForm } from "@/ui";

// 비운 시세 칸은 null로 둔다
type MarketRow = Omit<Market, "price"> & { price: number | null };

interface MarketPriceFormProps {
  // 서버 시세. '시세 불러오기'와, 초기값이 없을 때 처음 채우는 데 쓴다.
  // 캐시에 남은 오래된 값으로 채우지 않도록 마운트 후 새로 받은 값만 넘긴다(isFetchedAfterMount)
  serverMarkets?: Market[];
  // 처음 채울 값(예: 브라우저에 저장해 둔 시세). 있으면 서버 시세보다 우선한다
  initialMarkets?: Market[];
  // 서버에 저장하는 화면은 정수 시세를 필수로 받는다(PUT /market 규칙)
  requirePrice?: boolean;
  submitText: string;
  submitting?: boolean;
  onSubmit: (markets: Market[]) => void;
}

// 재료 시세 입력 표
export function MarketPriceForm({
  serverMarkets,
  initialMarkets,
  requirePrice = false,
  submitText,
  submitting,
  onSubmit,
}: MarketPriceFormProps) {
  const source = initialMarkets ?? serverMarkets;
  const { values, errors, setValues, handleSubmit } = useForm<{
    markets: MarketRow[];
  }>(
    () => ({ markets: source ?? [] }),
    ({ markets }) =>
      requirePrice
        ? Object.fromEntries(
            markets.map((market, index) => [
              `markets.${index}.price`,
              market.price == null ? "시세를 입력해주세요" : undefined,
            ])
          )
        : {}
  );

  // 처음 값이 준비되면 한 번만 채운다(이후 재조회가 입력 중인 값을 덮어쓰지 않도록).
  // 값은 보통 마운트 뒤에 도착하고, 호출부가 key를 넘기지 않아도 되도록 렌더 중에 채운다.
  const [filled, setFilled] = useState(!!source);
  if (!filled && source) {
    setFilled(true);
    setValues({ markets: source });
  }

  const setPrice = (index: number, price: number | null) =>
    setValues(({ markets }) => ({
      markets: markets.map((market, i) =>
        i === index ? { ...market, price } : market
      ),
    }));

  return (
    <form
      onSubmit={handleSubmit(({ markets }) =>
        // 입력칸이 있는 값만 넘긴다. 필수가 아니면 빈 시세(null)도 그대로 넘긴다(parseMarketList가 받는다)
        onSubmit(
          markets.map(({ id, name, price }) => ({
            id,
            name,
            // ponytail: FreePage 경로(requirePrice 아님)에서 넘어가는 null을 이 단언이 가린다.
            // Market.price를 number | null로 넓히고 서버 계약(계산 요청이 null 시세를 받는지)을 확인한 뒤 없앤다
            price: price as number,
          }))
        )
      )}
    >
      <Stack justify='space-between' style={{ marginBottom: 10 }}>
        <Button
          onClick={() => {
            if (serverMarkets) setValues({ markets: serverMarkets });
          }}
          disabled={!serverMarkets}
        >
          시세 불러오기
        </Button>
        <Button variant='primary' type='submit' loading={submitting}>
          {submitText}
        </Button>
      </Stack>
      <Table
        rowKey={(market) => market.id}
        data={values.markets}
        pagination={false}
        columns={[
          {
            title: "물품명",
            key: "name",
            render: (market) => (
              <Input aria-label='물품명' value={market.name} disabled />
            ),
          },
          {
            title: "시세",
            key: "price",
            render: (market, index) => (
              <Field
                label={`${market.name} 시세`}
                hideLabel
                required={requirePrice}
                error={errors[`markets.${index}.price`]}
                style={{ marginBottom: 0 }}
              >
                <NumberInput
                  suffix='골드'
                  style={{ width: 180 }}
                  min={0}
                  precision={requirePrice ? 0 : undefined}
                  value={market.price}
                  onChange={(price) => setPrice(index, price)}
                />
              </Field>
            ),
          },
        ]}
      />
    </form>
  );
}
