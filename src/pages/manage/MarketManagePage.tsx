import { App, Button, Typography } from "antd";
import { useUpdateMarketsMutation } from "queries/market";
import { FormProvider, useForm } from "react-hook-form";
import { Market } from "types/market";
import { MarketTable } from "components/market/MarketTable";

export function MarketManagePage() {
  const { message } = App.useApp();

  const { isLoading, mutate } = useUpdateMarketsMutation();

  const form = useForm<{ markets: Market[] }>({
    defaultValues: { markets: [] },
  });
  const { handleSubmit } = form;

  const onSubmit = ({ markets }: { markets: Market[] }) => {
    mutate(markets, {
      onSuccess: () => {
        message.success("수정되었습니다.");
      },
      onError: () => {
        message.error("실패했습니다.");
      },
    });
  };

  return (
    <div>
      <Typography.Title level={4}>시세 리스트</Typography.Title>
      <Button
        type='primary'
        disabled={isLoading}
        onClick={handleSubmit(onSubmit)}
        style={{ float: "right" }}
      >
        수정
      </Button>
      <FormProvider {...form}>
        <MarketTable isUsedLocalStorage={false} />
      </FormProvider>
    </div>
  );
}
