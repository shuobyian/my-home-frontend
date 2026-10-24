import {
  createProduct,
  createProducts,
  deleteProducts,
  fetchAllProducts,
  fetchProducts,
  updateProduct,
} from "@/apis/product";
import { useInvalidateCatalog } from "@/queries/invalidate";
import { productKeys } from "@/queries/keys";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { ProductSearchParams } from "@/types/product";

export { productKeys } from "@/queries/keys";

export const useProductsQuery = (params: ProductSearchParams) =>
  useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    // 페이지·검색어가 바뀌는 동안 이전 목록을 유지해 깜빡임을 없앤다
    placeholderData: keepPreviousData,
  });

// 쪽을 나누지 않은 전체 물품(이름 비교·물품 찾기용)
export const useAllProductsQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: productKeys.allList,
    queryFn: fetchAllProducts,
    enabled,
    // 화면에서 오류를 직접 보여 준다
    throwOnError: false,
  });

// 물품을 저장하면 서버가 결과도 함께 만들고 다시 계산하므로 카탈로그 전체를 다시 받는다
export const useCreateProductMutation = () =>
  useMutation({
    mutationFn: createProduct,
    onSuccess: useInvalidateCatalog(),
  });

export const useCreateProductsMutation = () =>
  useMutation({
    mutationFn: createProducts,
    onSuccess: useInvalidateCatalog(),
  });

export const useUpdateProductMutation = () =>
  useMutation({
    mutationFn: updateProduct,
    onSuccess: useInvalidateCatalog(),
  });

export const useDeleteProductsMutation = () =>
  useMutation({
    mutationFn: deleteProducts,
    onSuccess: useInvalidateCatalog(),
  });
