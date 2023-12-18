import { Button, Typography } from "antd";
import { IMarket } from "apis/market/putMarkets";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { MARKET } from "util/constant/LOCAL_STORAGE_KEY";
import { MarketList } from "view/components/shared/MarketList";

export function Free() {
  const navigate = useNavigate();

  const form = useForm<{ markets: IMarket[] }>({
    defaultValues: { markets: [] },
  });
  const { handleSubmit } = form;

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = ({ markets }: { markets: IMarket[] }) => {
    try {
      setIsLoading(true);
      localStorage.setItem(MARKET, JSON.stringify(markets));
      navigate("result", { state: { markets } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography.Title level={4}>
            자유 모드는 직접 재료의 시세를 입력할 수 있는 모드입니다.
          </Typography.Title>
          <Typography.Title level={5}>
            입력한 시세에 따라 계산된 결과를 확인할 수 있습니다.
          </Typography.Title>
          <Typography.Text>
            1. '시세 불러오기' 버튼을 클릭하면 기본 시세 데이터를 불러올 수
            있습니다.
          </Typography.Text>
          <Typography.Text>
            2. 시세 입력 후 '결과 만들기' 클릭하면 결과를 확인할 수 있습니다.
          </Typography.Text>
        </div>
        <Button
          type='primary'
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
          style={{ float: "right", margin: "10px" }}
        >
          결과 만들기
        </Button>
      </div>
      <FormProvider {...form}>
        <MarketList isUsedLocalStorage={true} />
      </FormProvider>
    </>
  );
}
