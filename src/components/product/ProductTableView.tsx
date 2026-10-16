import {
  Button,
  Divider,
  Input,
  Space,
  Table,
  TableColumnsType,
  Typography,
} from "antd";
import { Product } from "types/product";
import { formatNumber } from "lib/format";
import { productColumns } from "components/product/productColumns";
import { ProductModal } from "components/product/ProductModal";

const columns: TableColumnsType<Product> = productColumns;

interface ProductTableViewProps {
  datas: Product[];
  total: number;
  // 조회 중 표시. 이전 목록을 유지하는 동안(keepPreviousData) 조작을 막는다
  loading?: boolean;
  openModal: () => void;
  onRemove?: () => void;
  onSave?: () => void;
  add: (data: Omit<Product, "id">) => void;
  edit: (data: Product) => void;
  selectedRow: Product | undefined;
  setSelectedRow: React.Dispatch<React.SetStateAction<Product | undefined>>;
  selectedRows: Product[];
  setSelectedRows: React.Dispatch<React.SetStateAction<Product[]>>;
  isModalOpened: boolean;
  setIsModalOpened: React.Dispatch<React.SetStateAction<boolean>>;
  name?: string;
  setName?: React.Dispatch<React.SetStateAction<string>>;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, size: number) => void;
  };
}

export function ProductTableView({
  datas,
  total,
  loading,
  openModal,
  onRemove,
  onSave,
  add,
  edit,
  selectedRow,
  setSelectedRow,
  selectedRows,
  setSelectedRows,
  isModalOpened,
  setIsModalOpened,
  name,
  setName,
  pagination,
}: ProductTableViewProps) {
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
          <Button onClick={openModal}>추가</Button>
          {onRemove && (
            <Button onClick={onRemove} disabled={selectedRows.length < 1}>
              삭제
            </Button>
          )}
        </Space>
        {onSave && (
          <Button onClick={onSave} type='primary'>
            저장
          </Button>
        )}
      </div>
      <Divider type='horizontal' />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {setName && (
          <Input
            placeholder='물품 이름'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text strong>
            선택된 물품 {formatNumber(selectedRows.length)}개
          </Typography.Text>
          <Typography.Text strong>
            총 물품 {formatNumber(total)}개
          </Typography.Text>
        </div>
        <Table
          loading={loading}
          pagination={pagination}
          onRow={(record) => {
            return {
              onClick: () => {
                setSelectedRow(record);
                setIsModalOpened(true);
              },
            };
          }}
          rowSelection={{
            type: "checkbox",
            onSelect: (record: Product, selected: boolean) => {
              if (!selected) {
                setSelectedRows((prev) =>
                  prev.filter((p) => p.id !== record.id)
                );
              }
            },
            onChange: (_, records: Product[], { type }) => {
              if (type === "all") setSelectedRows(records);
              else {
                setSelectedRows((prev) =>
                  [...prev, ...records].reduce<Product[]>(
                    (ac, v) =>
                      ac.find((a) => a.id === v.id) ? ac : [...ac, v],
                    []
                  )
                );
              }
            },
          }}
          columns={columns.map((column) => ({ ...column, ellipsis: true }))}
          dataSource={datas.map((data) => ({
            key: data.id,
            ...data,
          }))}
          scroll={{
            x: columns.reduce((acc, cur) => (acc += Number(cur.width)), 0),
          }}
        />
      </div>
      {isModalOpened && (
        <ProductModal
          prevData={selectedRow}
          add={add}
          edit={edit}
          open={isModalOpened}
          onCancel={() => {
            setIsModalOpened(false);
            setSelectedRow(undefined);
          }}
        />
      )}
    </>
  );
}
