import {
  createProduct,
  createProducts,
  deleteProducts,
  fetchProducts,
  updateProduct,
} from "apis/product";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ProductSearchParams } from "types/product";

export const productKeys = {
  all: ["product"] as const,
  list: (params: ProductSearchParams) =>
    [...productKeys.all, "list", params] as const,
};

export const useProductsQuery = (params: ProductSearchParams) =>
  useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    // 페이지·검색어가 바뀌는 동안 이전 목록을 유지해 깜빡임을 없앤다
    placeholderData: keepPreviousData,
  });

// 물품이 바뀌면 물품 목록을 다시 불러온다.
// 완료를 기다리지 않아 호출부의 성공 메시지가 바로 뜬다.
function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: productKeys.all });
  };
}

export const useCreateProductMutation = () =>
  useMutation({
    mutationFn: createProduct,
    onSuccess: useInvalidateProducts(),
  });

export const useCreateProductsMutation = () =>
  useMutation({
    mutationFn: createProducts,
    onSuccess: useInvalidateProducts(),
  });

export const useUpdateProductMutation = () =>
  useMutation({
    mutationFn: updateProduct,
    onSuccess: useInvalidateProducts(),
  });

export const useDeleteProductsMutation = () =>
  useMutation({
    mutationFn: deleteProducts,
    onSuccess: useInvalidateProducts(),
  });
