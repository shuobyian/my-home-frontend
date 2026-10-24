import { getErrorMessage } from "@/apis/errors";
import { ProductTableView } from "@/components/product/ProductTableView";
import {
  useCreateProductMutation,
  useDeleteProductsMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from "@/queries/product";
import { useState } from "react";
import { ProductSearchParams } from "@/types/product";
import { Stack, Title, useToast } from "@/ui";

// 서버에 저장된 물품 목록 관리(조회·추가·수정·삭제). 결과는 물품을 저장할 때 서버가 함께 맞춘다.
export function ProductManagePage() {
  const toast = useToast();

  const [params, setParams] = useState<ProductSearchParams>({
    page: 0,
    size: 10,
    name: "",
  });
  const { data, isFetching, isPlaceholderData } = useProductsQuery(params);

  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  const deleteProducts = useDeleteProductsMutation();

  // 마지막 페이지의 물품을 모두 지우는 등으로 보던 페이지가 범위를 넘으면 마지막 페이지로 바로잡는다.
  // 새 페이지를 받는 동안 보이는 이전 목록으로는 판단하지 않는다(한 쪽씩 연달아 넘어가지 않도록).
  const lastPage = data
    ? Math.max(0, Math.ceil(data.totalElements / params.size) - 1)
    : 0;
  if (data && !isPlaceholderData && params.page > lastPage) {
    setParams({ ...params, page: lastPage });
  }

  // 성공·실패 메시지를 보여 주고, 실패는 호출부(모달 유지 등)로 다시 던진다
  const run = async (task: () => Promise<unknown>, successMessage: string) => {
    try {
      await task();
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <Stack vertical>
      <Title level={4} style={{ margin: 0 }}>
        물품 리스트
      </Title>
      <ProductTableView
        products={data?.content ?? []}
        total={data?.totalElements ?? 0}
        loading={isFetching}
        pagination={{
          current: params.page + 1,
          pageSize: params.size,
          onChange: (page, size) =>
            setParams((prev) => ({ ...prev, page: page - 1, size })),
        }}
        onSearch={(name) => setParams((prev) => ({ ...prev, name, page: 0 }))}
        onAdd={(product) =>
          run(() => createProduct.mutateAsync(product), "추가되었습니다.")
        }
        onEdit={(product) =>
          run(() => updateProduct.mutateAsync(product), "수정되었습니다.")
        }
        onRemove={(products) =>
          run(
            () =>
              deleteProducts.mutateAsync({ ids: products.map(({ id }) => id) }),
            "삭제되었습니다."
          )
        }
      />
    </Stack>
  );
}
