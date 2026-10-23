import { getErrorMessage } from "@/apis/errors";
import { MarketPriceForm } from "@/components/market/MarketPriceForm";
import { useMarketsQuery, useUpdateMarketsMutation } from "@/queries/market";
import { Market } from "@/types/market";
import { Paragraph, Title, useToast } from "@/ui";

export function MarketManagePage() {
  const toast = useToast();

  // 캐시에 남은 오래된 시세로 채우면 저장 시 최신 시세를 덮어쓰므로 새로 받은 값만 쓴다
  const { data, isFetchedAfterMount } = useMarketsQuery();
  const serverMarkets = isFetchedAfterMount ? data : undefined;
  const { isPending, mutate } = useUpdateMarketsMutation();

  const onSubmit = (markets: Market[]) => {
    mutate(markets, {
      onSuccess: () => {
        toast.success("수정되었습니다.");
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  return (
    <div>
      <Title level={4}>시세 리스트</Title>
      <Paragraph tone='secondary'>
        저장하면 모든 결과 리스트의 금액이 새 시세로 다시 계산됩니다.
      </Paragraph>
      <MarketPriceForm
        serverMarkets={serverMarkets}
        requirePrice
        submitText='수정'
        submitting={isPending}
        onSubmit={onSubmit}
      />
    </div>
  );
}
