/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Container, Snackbar } from "@mui/material";
import { IMarket } from "apis/putMarkets";
import { useMarketMutation } from "queries/useMarketMutation";
import { useState } from "react";
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

  const [message, setMessage] = useState<string>();

  const onSubmit = ({ markets }: { markets: IMarket[] }) => {
    mutate(markets, {
      onSuccess: () => {
        setMessage("수정되었습니다.");
        queryClient.invalidateQueries("market");
      },
      onError: () => {
        setMessage("실패했습니다.");
      },
    });
  };

  return (
    <Container maxWidth='lg'>
      <Snackbar
        open={!!message}
        onClose={() => setMessage(undefined)}
        autoHideDuration={1000}
        message='수정되었습니다.'
      />
      <Button
        variant='outlined'
        disabled={isLoading}
        onClick={handleSubmit(onSubmit)}
        style={{ float: "right", margin: "10px" }}
      >
        수정
      </Button>
      <FormProvider {...form}>
        <MarketList isUsedLocalStorage={false} />
      </FormProvider>
    </Container>
  );
}
