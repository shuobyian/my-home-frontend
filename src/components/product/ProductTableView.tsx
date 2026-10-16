import {
  App,
  Button,
  Divider,
  Space,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import { SearchBar } from "@/components/common/SearchBar";
import { productColumns } from "@/components/product/productColumns";
import { ProductModal } from "@/components/product/ProductModal";
import { ProductNameList } from "@/components/product/ProductNameList";
import { formatNumber } from "@/lib/format";
import { Key, ReactNode, useState } from "react";
import { Product, ProductCreateRequest } from "@/types/product";

const columns: TableColumnsType<Product> = productColumns.map((column) => ({
  ...column,
  ellipsis: true,
}));

const scrollX = productColumns.reduce(
  (acc, { width }) => acc + Number(width ?? 0),
  0
);

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
  // 아래 콜백은 실패하면 reject한다(모달·선택 상태를 유지).
  onAdd: (product: ProductCreateRequest) => Promise<void>;
  onEdit: (product: Product) => Promise<void>;
  onRemove: (products: Product[]) => Promise<void>;
  toolbarExtra?: ReactNode;
}

interface Selection {
  keys: Key[];
  rows: Product[];
}

const EMPTY_SELECTION: Selection = { keys: [], rows: [] };

// 물품 표. 선택·모달·검색어 상태는 이 컴포넌트가 갖고, 데이터 변경은 콜백으로 위임한다.
export function ProductTableView({
  products,
  total,
  loading,
  pagination,
  onSearch,
  onAdd,
  onEdit,
  onRemove,
  toolbarExtra,
}: ProductTableViewProps) {
  const { modal } = App.useApp();

  // 페이지를 넘겨도 선택을 유지한다(preserveSelectedRowKeys). 검색어가 바뀌면 초기화한다.
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [editing, setEditing] = useState<{ product?: Product } | null>(null);
  const search = (keyword: string) => {
    setSelection(EMPTY_SELECTION);
    onSearch?.(keyword);
  };

  const confirmRemove = () => {
    const targets = selection.rows;
    // then을 붙이면 onOk가 실패(reject)해도 antd가 다시 던지지 않고 확인창을 유지한다
    modal
      .confirm({
        title: `${formatNumber(targets.length)}개 물품을 삭제하시겠습니까?`,
        content: <ProductNameList products={targets} />,
        okText: "삭제",
        cancelText: "취소",
        onOk: async () => {
          await onRemove(targets);
          setSelection(EMPTY_SELECTION);
        },
      })
      .then(
        () => undefined,
        () => undefined
      );
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Space direction='horizontal'>
          <Button onClick={() => setEditing({})}>추가</Button>
          <Button onClick={confirmRemove} disabled={selection.rows.length < 1}>
            삭제
          </Button>
        </Space>
        {toolbarExtra}
      </div>
      <Divider type='horizontal' />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {onSearch && <SearchBar placeholder='물품 이름' onSearch={search} />}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography.Text strong>
            선택된 물품 {formatNumber(selection.rows.length)}개
          </Typography.Text>
          <Typography.Text strong>
            총 물품 {formatNumber(total)}개
          </Typography.Text>
        </div>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          dataSource={products}
          pagination={pagination ? { ...pagination, total } : undefined}
          scroll={{ x: scrollX }}
          onRow={(record) => ({
            onClick: () => setEditing({ product: record }),
          })}
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selection.keys,
            preserveSelectedRowKeys: true,
            onChange: (keys, rows) => setSelection({ keys, rows }),
          }}
        />
      </div>
      {editing && (
        <ProductModal
          product={editing.product}
          onSubmit={(value) =>
            editing.product
              ? onEdit(value as Product)
              : onAdd(value as ProductCreateRequest)
          }
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
