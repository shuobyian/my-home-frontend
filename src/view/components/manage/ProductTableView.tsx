import { Button, Divider, Space, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { Product } from "apis/product/getProducts";
import { StringUtil } from "util/StringUtil";
import { materialColumns } from "util/constant/materialColumns";
import { ProductModal } from "view/components/manage/modal/ProductModal";

const columns: ColumnsType<Product> = materialColumns;

interface IProductTableViewProps {
  datas: Product[];
  total: number;
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
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, size: number) => void;
  };
}

export default function ProductTableView({
  datas,
  total,
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
  pagination,
}: IProductTableViewProps) {
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography.Text strong>
            선택된 물품 {StringUtil.numberWithCommas(selectedRows.length)}개
          </Typography.Text>
          <Typography.Text strong>
            총 물품 {StringUtil.numberWithCommas(total)}개
          </Typography.Text>
        </div>
        <Table
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
