/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Input, InputNumber } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { IMarket } from "apis/putMarkets";
import { useMarketQuery } from "queries/useMarketQuery";
import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { MARKET } from "util/constant/LOCAL_STORAGE_KEY";

const MARKET_LIST = localStorage.getItem(MARKET);

interface IMarketListProps {
  isUsedLocalStorage: boolean;
}

export function MarketList({ isUsedLocalStorage }: IMarketListProps) {
  const form = useFormContext<{ markets: IMarket[] }>();
  const { control, reset, getValues } = form;

  const { data } = useMarketQuery();

  const columns: ColumnsType<IMarket> = [
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
      width: 400,
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
