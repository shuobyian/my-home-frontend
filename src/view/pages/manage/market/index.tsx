/* eslint-disable react-hooks/exhaustive-deps */
import { Button, message } from "antd";
import { IMarket } from "apis/putMarkets";
import { useMarketMutation } from "queries/useMarketMutation";
import { FormProvider, useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { MarketList } from "view/components/shared/MarketList";

export function Market() {
  const queryClient = useQueryClient();
  const { isLoading, mutate } = useMarketMutation();

  const form = useForm<{ markets: IMarket[] }>({
    defaultValues: { markets: [] },
  });
  const { handleSubmit } = form;

  const onSubmit = ({ markets }: { markets: IMarket[] }) => {
    mutate(markets, {
      onSuccess: () => {
        message.success("수정되었습니다.");
        queryClient.invalidateQueries("market");
      },
      onError: () => {
        message.error("실패했습니다.");
      },
    });
  };

  return (
    <div>
      <Button
        type='primary'
        disabled={isLoading}
        onClick={handleSubmit(onSubmit)}
        style={{ float: "right" }}
      >
        수정
      </Button>
      <FormProvider {...form}>
        <MarketList isUsedLocalStorage={false} />
      </FormProvider>
    </div>
  );
}
