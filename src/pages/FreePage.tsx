import { Space, Typography } from "antd";
import { ROUTES } from "app/routes";
import { MarketPriceForm } from "components/market/MarketPriceForm";
import { parseMarketList } from "domain/market";
import { readJSON, STORAGE_KEY, writeJSON } from "lib/storage";
import { useMarketsQuery } from "queries/market";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Market } from "types/market";

export function FreePage() {
  const navigate = useNavigate();
  const { data: serverMarkets } = useMarketsQuery();

  // 마지막으로 입력해 둔 시세가 있으면 그 값으로 시작한다(마운트 시 한 번 읽기)
  const [savedMarkets] = useState(() =>
    parseMarketList(readJSON(STORAGE_KEY.MARKET))
  );

  const onSubmit = (markets: Market[]) => {
    writeJSON(STORAGE_KEY.MARKET, markets);
    navigate(ROUTES.FREE_RESULT, { state: { markets } });
  };

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Space direction='vertical' size={0}>
        <Typography.Title level={4}>
          자유 모드는 직접 재료의 시세를 입력할 수 있는 모드입니다.
        </Typography.Title>
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          입력한 시세에 따라 계산된 결과를 확인할 수 있습니다.
        </Typography.Title>
        <Typography.Text>
          1. '시세 불러오기' 버튼을 클릭하면 기본 시세 데이터를 불러올 수
          있습니다.
        </Typography.Text>
        <Typography.Text>
          2. 시세 입력 후 '결과 만들기' 클릭하면 결과를 확인할 수 있습니다.
        </Typography.Text>
      </Space>
      <MarketPriceForm
        serverMarkets={serverMarkets}
        initialMarkets={savedMarkets}
        submitText='결과 만들기'
        onSubmit={onSubmit}
      />
    </Space>
  );
}
