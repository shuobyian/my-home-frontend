import { Button, Input, InputNumber } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useMarketsQuery } from "queries/market";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Market } from "types/market";
import { MARKET } from "util/constant/LOCAL_STORAGE_KEY";

const MARKET_LIST = localStorage.getItem(MARKET);

interface IMarketListProps {
  isUsedLocalStorage: boolean;
}

export function MarketList({ isUsedLocalStorage }: IMarketListProps) {
  const form = useFormContext<{ markets: Market[] }>();
  const { control, reset, getValues } = form;

  const { data } = useMarketsQuery();

  const columns: ColumnsType<Market> = [
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
    if (isUsedLocalStorage)
      reset({ markets: MARKET_LIST ? JSON.parse(MARKET_LIST) : data });

    if (!isUsedLocalStorage) resetData();
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
