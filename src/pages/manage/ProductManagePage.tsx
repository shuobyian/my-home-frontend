import { getErrorMessage } from "@/apis/errors";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { ProductStatusText } from "@/components/catalog/ProductStatusText";
import { ProductTableView } from "@/components/product/ProductTableView";
import { statusByProductId, toCatalogNames } from "@/domain/catalog";
import { useSaveProduct } from "@/pages/manage/useSaveProduct";
import { useCatalogCheckQuery } from "@/queries/catalog";
import { useDeleteProductsMutation, useProductsQuery } from "@/queries/product";
import { useMemo, useState } from "react";
import { ProductSearchParams } from "@/types/product";
import { Stack, Title, useDialogs, useToast } from "@/ui";

// 서버에 저장된 물품 목록 관리(조회·추가·수정·삭제). 결과는 물품을 저장할 때 서버가 함께 맞춘다.
export function ProductManagePage() {
  const toast = useToast();
  const dialogs = useDialogs();

  const [params, setParams] = useState<ProductSearchParams>({
    page: 0,
    size: 10,
    name: "",
  });
  const { data, isFetching, isPlaceholderData } = useProductsQuery(params);
  // 물품마다의 결과 상태와, 재료 이름을 맞춰 볼 시세·물품 이름
  const checkQuery = useCatalogCheckQuery();
  const { data: check } = checkQuery;
  const statuses = useMemo(() => check && statusByProductId(check), [check]);
  const catalogNames = useMemo(() => check && toCatalogNames(check), [check]);

  const saveProduct = useSaveProduct();
  const deleteProducts = useDeleteProductsMutation();

  // 마지막 페이지의 물품을 모두 지우는 등으로 보던 페이지가 범위를 넘으면 마지막 페이지로 바로잡는다.
  // 새 페이지를 받는 동안 보이는 이전 목록으로는 판단하지 않는다(한 쪽씩 연달아 넘어가지 않도록).
  const lastPage = data
    ? Math.max(0, Math.ceil(data.totalElements / params.size) - 1)
    : 0;
  if (data && !isPlaceholderData && params.page > lastPage) {
    setParams({ ...params, page: lastPage });
  }

  // 실패하면 서버 메시지(다른 물품이 쓰는 물품 목록 등)를 남는 알림창으로 보여 주고 선택을 유지한다
  const remove = async (ids: number[]) => {
    try {
      await deleteProducts.mutateAsync({ ids });
      toast.success("삭제되었습니다.");
    } catch (error) {
      dialogs.alert({
        status: "error",
        title: "삭제하지 못했습니다",
        content: getErrorMessage(error),
      });
      throw error;
    }
  };

  return (
    <Stack vertical>
      <Title level={4} style={{ margin: 0 }}>
        물품 리스트
      </Title>
      <CatalogStatusBanner
        check={check}
        loading={checkQuery.isPending}
        error={checkQuery.isError}
      />
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
        catalogNames={catalogNames}
        requireNewMarketPrices
        renderStatus={({ id }) => (
          <ProductStatusText status={statuses?.get(id)} />
        )}
        onAdd={saveProduct.add}
        onEdit={saveProduct.edit}
        onRemove={(products) => remove(products.map(({ id }) => id))}
      />
    </Stack>
  );
}
