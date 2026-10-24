import { getErrorMessage } from "@/apis/errors";
import { formatNumber } from "@/lib/format";
import { useInvalidateCatalogCheck } from "@/queries/catalog";
import { useUpdateMarketsMutation } from "@/queries/market";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/queries/product";
import { useEffect, useRef } from "react";
import { NewMarket } from "@/types/market";
import { Product, ProductCreateRequest } from "@/types/product";
import { useDialogs, useToast } from "@/ui";

// 서버 물품 저장(물품 리스트·데이터 점검 화면 공통).
// 서버는 시세 없는 재료를 거절하므로, 모달에서 받은 새 시세를 먼저 PUT /market으로 추가한 뒤 물품을 저장한다.
// 실패하면 서버 메시지를 남는 알림창으로 보여 주고 다시 던진다(모달은 입력을 유지한 채 열려 있다).
// marketNames는 모달이 새 재료를 가르는 데 쓰는 서버 시세 이름(점검 정보)이다.
export function useSaveProduct(marketNames?: ReadonlySet<string>) {
  const toast = useToast();
  const dialogs = useDialogs();
  const updateMarkets = useUpdateMarketsMutation();
  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  const invalidateCatalogCheck = useInvalidateCatalogCheck();
  // 이 화면에서 시세에 추가했지만 아직 서버 시세 이름에서 보지 못한 이름.
  // 물품 저장만 실패해 다시 제출할 때 같은 시세를 또 만들지 않는다
  // (점검 정보를 다시 받기 전까지는 모달이 아직 새 재료로 본다).
  // 서버 시세 이름에 나타나면 뺀다. 그 뒤에 시세가 지워져 모달이 다시 새 재료로 보면 다시 만들어야 한다.
  const createdMarketsRef = useRef(new Set<string>());
  useEffect(() => {
    marketNames?.forEach((name) => createdMarketsRef.current.delete(name));
  }, [marketNames]);

  const createMarkets = async (markets: NewMarket[]) => {
    const created = createdMarketsRef.current;
    // 요청 중에 도착한 점검 정보가 이 이름을 보여 주면 바로 빠지도록 먼저 기록한다
    markets.forEach(({ name }) => created.add(name));
    try {
      await updateMarkets.mutateAsync(markets);
    } catch (error) {
      markets.forEach(({ name }) => created.delete(name));
      // 점검 정보가 낡아 다른 곳에서 이미 만든 시세를 새 재료로 봤을 수 있으므로 다시 받는다.
      // 물품 목록 등은 다시 받지 않는다(연결이 끊겼으면 그 실패가 오류 화면으로 올라가 모달 입력이 사라진다).
      invalidateCatalogCheck();
      throw error;
    }
  };

  const save = async (
    saveProduct: () => Promise<unknown>,
    newMarkets: NewMarket[],
    message: string
  ) => {
    try {
      const pending = newMarkets.filter(
        ({ name }) => !createdMarketsRef.current.has(name)
      );
      if (pending.length > 0) await createMarkets(pending);
      await saveProduct();
      toast.success(
        newMarkets.length > 0
          ? `새 시세 ${formatNumber(newMarkets.length)}개와 함께 ${message}`
          : message
      );
    } catch (error) {
      dialogs.alert({
        status: "error",
        title: "저장하지 못했습니다",
        content: getErrorMessage(error),
      });
      throw error;
    }
  };

  return {
    add: (product: ProductCreateRequest, newMarkets: NewMarket[]) =>
      save(
        () => createProduct.mutateAsync(product),
        newMarkets,
        "추가했습니다. 결과 리스트에도 반영했습니다."
      ),
    edit: (product: Product, newMarkets: NewMarket[]) =>
      save(
        () => updateProduct.mutateAsync(product),
        newMarkets,
        "수정했습니다. 이 물품을 재료로 쓰는 물품의 결과도 다시 계산했습니다."
      ),
  };
}
