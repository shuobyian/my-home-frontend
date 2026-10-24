import { getErrorMessage } from "@/apis/errors";
import { formatNumber } from "@/lib/format";
import { useUpdateMarketsMutation } from "@/queries/market";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/queries/product";
import { useRef } from "react";
import { NewMarket } from "@/types/market";
import { Product, ProductCreateRequest } from "@/types/product";
import { useDialogs, useToast } from "@/ui";

// 서버 물품 저장(물품 리스트·데이터 점검 화면 공통).
// 서버는 시세 없는 재료를 거절하므로, 모달에서 받은 새 시세를 먼저 PUT /market으로 추가한 뒤 물품을 저장한다.
// 실패하면 서버 메시지를 남는 알림창으로 보여 주고 다시 던진다(모달은 입력을 유지한 채 열려 있다).
export function useSaveProduct() {
  const toast = useToast();
  const dialogs = useDialogs();
  const updateMarkets = useUpdateMarketsMutation();
  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  // 이 화면에서 이미 시세에 추가한 이름. 물품 저장만 실패해 다시 제출할 때 같은 시세를 또 만들지 않는다
  // (점검 정보를 다시 받기 전까지는 모달이 아직 새 재료로 본다)
  const createdMarketsRef = useRef(new Set<string>());

  const save = async (
    saveProduct: () => Promise<unknown>,
    newMarkets: NewMarket[],
    message: string
  ) => {
    try {
      const pending = newMarkets.filter(
        ({ name }) => !createdMarketsRef.current.has(name)
      );
      if (pending.length > 0) {
        await updateMarkets.mutateAsync(pending);
        pending.forEach(({ name }) => createdMarketsRef.current.add(name));
      }
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
