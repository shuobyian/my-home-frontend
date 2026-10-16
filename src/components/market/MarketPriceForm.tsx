import { Button, Input, InputNumber, Table, TableColumnsType } from "antd";
import { useMarketsQuery } from "queries/market";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Market } from "types/market";
import { parseMarketList } from "domain/market";
import { readJSON, STORAGE_KEY } from "lib/storage";

interface MarketTableProps {
  isUsedLocalStorage: boolean;
}

export function MarketTable({ isUsedLocalStorage }: MarketTableProps) {
  const form = useFormContext<{ markets: Market[] }>();
  const { control, reset, getValues } = form;

  const { data } = useMarketsQuery();

  const columns: TableColumnsType<Market> = [
    {
      title: "물품명",
      dataIndex: "name",
      key: "name",
      render: (_, __, i) => (
        <Controller
          name={`markets.${i}.name`}
          control={control}
          render={({ field }) => <Input value={field.value} disabled={true} />}
        />
      ),
    },
    {
      title: "시세",
      dataIndex: "price",
      key: "price",
      render: (_, __, i) => (
        <Controller
          name={`markets.${i}.price`}
          control={control}
          render={({ field }) => (
            <InputNumber
              value={field.value}
              onChange={field.onChange}
              pattern='[0-9]*'
              addonAfter='골드'
            />
          )}
        />
      ),
    },
  ];

  const resetData = () => {
    reset({ markets: data });
  };

  useEffect(() => {
    // 저장된 시세는 이 시점에 읽는다(모듈 최상단에서 읽으면 앱 시작 시점 값에 고정된다)
    const saved = isUsedLocalStorage
      ? parseMarketList(readJSON(STORAGE_KEY.MARKET))
      : undefined;
    reset({ markets: saved ?? data });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 시세 데이터를 받았을 때만 폼을 초기화한다
  }, [data]);

  return (
    <div style={{ textAlign: "left" }}>
      <Button onClick={resetData} style={{ margin: "10px" }}>
        시세 불러오기
      </Button>
      <Table
        columns={columns}
        dataSource={
          getValues("markets")?.map((market) => ({
            ...market,
            key: market.id,
          })) || []
        }
        pagination={false}
      />
    </div>
  );
}
