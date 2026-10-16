import { App, Button, Typography } from "antd";
import { getErrorMessage } from "@/apis/errors";
import { ProductTableView } from "@/components/product/ProductTableView";
import {
  useCreateProductMutation,
  useDeleteProductsMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from "@/queries/product";
import { useCreateResultsMutation } from "@/queries/result";
import { useState } from "react";
import { ProductSearchParams } from "@/types/product";

// 서버에 저장된 물품 목록 관리
export function ProductTable() {
  const { message } = App.useApp();

  const [params, setParams] = useState<ProductSearchParams>({
    page: 0,
    size: 10,
    name: "",
  });
  const { data, isFetching, isPlaceholderData } = useProductsQuery(params);

  const createProduct = useCreateProductMutation();
  const updateProduct = useUpdateProductMutation();
  const deleteProducts = useDeleteProductsMutation();
  const createResults = useCreateResultsMutation();

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
      message.success(successMessage);
    } catch (error) {
      message.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <>
      <Button
        style={{ float: "right" }}
        type='primary'
        loading={createResults.isPending}
        onClick={() =>
          createResults.mutate(undefined, {
            onSuccess: () => {
              message.success("결과가 생성되었습니다.");
            },
            onError: (error) => {
              message.error(getErrorMessage(error));
            },
          })
        }
      >
        결과 리스트 생성
      </Button>
      <Typography.Title level={4}>물품 리스트</Typography.Title>
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
    </>
  );
}
