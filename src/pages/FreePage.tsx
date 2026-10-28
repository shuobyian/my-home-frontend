import { ROUTES } from "@/app/routes";
import { CartButton } from "@/components/cart/CartButton";
import { Guide } from "@/components/common/Guide";
import { MarketPriceForm } from "@/components/market/MarketPriceForm";
import { parseMarketList } from "@/domain/market";
import { readJSON, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { useMarketsQuery } from "@/queries/market";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Market } from "@/types/market";
import { Stack, Text, useToast } from "@/ui";

export function FreePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data, isFetchedAfterMount } = useMarketsQuery();
  const serverMarkets = isFetchedAfterMount ? data : undefined;

  // 마지막으로 입력해 둔 시세가 있으면 그 값으로 시작한다(마운트 시 한 번 읽기)
  const [savedMarkets] = useState(() =>
    parseMarketList(readJSON(STORAGE_KEY.MARKET))
  );

  const onSubmit = (markets: Market[]) => {
    writeJSON(STORAGE_KEY.MARKET, markets);
    navigate(ROUTES.FREE_RESULT, { state: { markets } });
  };

  return (
    <Stack vertical>
      <Guide
        title='자유 모드는 직접 재료의 시세를 입력할 수 있는 모드입니다.'
        action={<CartButton scope='free' />}
        steps={
          <>
            <li>
              <Text strong>시세 불러오기</Text>를 누르면 기본 시세 데이터를
              불러옵니다.
            </li>
            <li>
              시세를 입력하고 <Text strong>결과 만들기</Text>를 누르면 계산된
              결과를 확인할 수 있습니다.
            </li>
          </>
        }
      />
      <MarketPriceForm
        serverMarkets={serverMarkets}
        initialMarkets={savedMarkets}
        onMarketsAdded={(added) =>
          toast.success(`새 재료 ${added.length}개를 시세에 추가했습니다.`)
        }
        submitText='결과 만들기'
        onSubmit={onSubmit}
      />
    </Stack>
  );
}
