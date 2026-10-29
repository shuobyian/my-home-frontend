import { SearchBar } from "@/components/common/SearchBar";
import { productColumns } from "@/components/product/productColumns";
import { ProductModal } from "@/components/product/ProductModal";
import { ProductNameList } from "@/components/product/ProductNameList";
import { CatalogNames } from "@/domain/catalog";
import { formatNumber } from "@/lib/format";
import { ReactNode, useState } from "react";
import { NewMarket } from "@/types/market";
import { Product, ProductCreateRequest } from "@/types/product";
import { Button, Stack, Table, TableColumn, Text, useDialogs } from "@/ui";

// 한 줄로 자르고 전체 글자는 title 속성으로 보여 준다
const columns: TableColumn<Product>[] = productColumns.map((column) => ({
  ...column,
  ellipsis: true,
}));

interface ProductTableViewProps {
  products: Product[];
  total: number;
  loading?: boolean;
  // 서버 페이지네이션. 없으면 표가 클라이언트에서 나눈다.
  pagination?: {
    current: number;
    pageSize: number;
    onChange: (page: number, pageSize: number) => void;
  };
  // 이름 검색. 있으면 검색창을 보여 준다.
  onSearch?: (name: string) => void;
  // 물품 모달로 넘긴다(ProductModal 참고)
  catalogNames?: CatalogNames;
  requireNewMarketPrices?: boolean;
  // 있으면 물품명 다음에 상태 열을 둔다
  renderStatus?: (product: Product) => ReactNode;
  // 아래 콜백은 실패하면 reject한다(모달·선택 상태를 유지).
  // newMarkets는 물품보다 먼저 시세에 추가할 새 재료다(requireNewMarketPrices가 아니면 []).
  onAdd: (
    product: ProductCreateRequest,
    newMarkets: NewMarket[]
  ) => Promise<void>;
  onEdit: (product: Product, newMarkets: NewMarket[]) => Promise<void>;
  onRemove: (products: Product[]) => Promise<void>;
  toolbarExtra?: ReactNode;
}

// 물품 표. 선택·모달·검색어 상태는 이 컴포넌트가 갖고, 데이터 변경은 콜백으로 위임한다.
export function ProductTableView({
  products,
  total,
  loading,
  pagination,
  onSearch,
  catalogNames,
  requireNewMarketPrices,
  renderStatus,
  onAdd,
  onEdit,
  onRemove,
  toolbarExtra,
}: ProductTableViewProps) {
  const dialogs = useDialogs();
  const tableColumns = renderStatus
    ? [
        columns[0],
        {
          title: "상태",
          key: "status",
          render: renderStatus,
          width: 160,
          ellipsis: true,
        },
        ...columns.slice(1),
      ]
    : columns;

  // 페이지를 넘겨도 선택을 유지한다(표가 처리). 검색어가 바뀌면 초기화한다.
  const [selection, setSelection] = useState<Product[]>([]);
  const [editing, setEditing] = useState<{ product?: Product } | null>(null);
  const search = (keyword: string) => {
    setSelection([]);
    onSearch?.(keyword);
  };

  const confirmRemove = () => {
    const targets = selection;
    // onOk가 실패(reject)하면 확인창을 열어 둔다
    dialogs.confirm({
      title: `${formatNumber(targets.length)}개 물품을 삭제하시겠습니까?`,
      content: <ProductNameList products={targets} />,
      okText: "삭제",
      cancelText: "취소",
      onOk: async () => {
        await onRemove(targets);
        setSelection([]);
      },
    });
  };

  return (
    <>
      <Stack justify='space-between'>
        <Stack>
          <Button onClick={() => setEditing({})}>추가</Button>
          <Button onClick={confirmRemove} disabled={selection.length < 1}>
            삭제
          </Button>
        </Stack>
        {toolbarExtra}
      </Stack>
      <hr />
      <Stack vertical gap='var(--ui-space-3)'>
        {onSearch && (
          <SearchBar
            placeholder='물품 이름'
            onSearch={search}
            loading={loading}
          />
        )}
        <Stack justify='space-between'>
          <Text strong>선택된 물품 {formatNumber(selection.length)}개</Text>
          <Text strong>총 물품 {formatNumber(total)}개</Text>
        </Stack>
        <Table
          rowKey={({ id }) => id}
          loading={loading}
          columns={tableColumns}
          data={products}
          pagination={{
            ...(pagination && {
              page: pagination.current,
              pageSize: pagination.pageSize,
              onChange: pagination.onChange,
              total,
            }),
            // 50개를 넘으면 쪽당 개수를 고를 수 있게 한다
            showSizeChanger: total > 50,
          }}
          onRowClick={(product) => setEditing({ product })}
          selection={{
            selected: selection,
            onChange: setSelection,
            label: ({ name }) => name,
          }}
        />
      </Stack>
      {editing && (
        <ProductModal
          product={editing.product}
          catalogNames={catalogNames}
          requireNewMarketPrices={requireNewMarketPrices}
          onSubmit={(value, newMarkets) =>
            editing.product
              ? onEdit(value as Product, newMarkets)
              : onAdd(value as ProductCreateRequest, newMarkets)
          }
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
