import { App, Typography } from "antd";
import { getErrorMessage } from "apis/errors";
import { MarketPriceForm } from "components/market/MarketPriceForm";
import { useMarketsQuery, useUpdateMarketsMutation } from "queries/market";
import { Market } from "types/market";

export function MarketManagePage() {
  const { message } = App.useApp();

  // 캐시에 남은 오래된 시세로 채우면 저장 시 최신 시세를 덮어쓰므로 새로 받은 값만 쓴다
  const { data, isFetchedAfterMount } = useMarketsQuery();
  const serverMarkets = isFetchedAfterMount ? data : undefined;
  const { isLoading, mutate } = useUpdateMarketsMutation();

  const onSubmit = (markets: Market[]) => {
    mutate(markets, {
      onSuccess: () => {
        message.success("수정되었습니다.");
      },
      onError: (error) => {
        message.error(getErrorMessage(error));
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4}>시세 리스트</Typography.Title>
      <Typography.Paragraph type='secondary'>
        저장하면 모든 결과 리스트의 금액이 새 시세로 다시 계산됩니다.
      </Typography.Paragraph>
      <MarketPriceForm
        serverMarkets={serverMarkets}
        requirePrice
        submitText='수정'
        submitting={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
}
