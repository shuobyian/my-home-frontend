import { App, Button, Typography } from "antd";
import { getErrorMessage } from "apis/errors";
import {
  useCreateProductMutation,
  useDeleteProductsMutation,
  useProductsQuery,
  useUpdateProductMutation,
} from "queries/product";
import { useCreateResultsMutation } from "queries/result";
import { useState } from "react";
import { Product } from "types/product";
import { ProductTableView } from "components/product/ProductTableView";

export function ProductTable() {
  const { message, modal } = App.useApp();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [name, setName] = useState("");

  const { data: product } = useProductsQuery({ page, size, name });

  const { mutate: add } = useCreateProductMutation();
  const { mutate: edit } = useUpdateProductMutation();
  const { mutate: remove } = useDeleteProductsMutation();

  const { isLoading, mutate: createResult } = useCreateResultsMutation();

  const [isModalOpened, setIsModalOpened] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Product>();
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);

  const openModal = () => {
    setIsModalOpened(true);
  };

  const onAdd = (data: Omit<Product, "id">) => {
    add(data, {
      onSuccess: () => {
        message.success("추가되었습니다.");
      },
      onError: () => {
        message.error("추가할 수 없습니다.");
      },
    });
  };

  const onEdit = (data: Product) => {
    edit(data, {
      onSuccess: () => {
        message.success("수정되었습니다.");
      },
      onError: () => {
        message.error("수정할 수 없습니다.");
      },
    });
  };

  const onRemove = () => {
    modal.confirm({
      title: "삭제하시겠습니까?",
      content: (
        <ul style={{ maxHeight: 400, overflow: "scroll" }}>
          {selectedRows.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      ),
      onOk: () => {
        remove(
          { ids: selectedRows.map((row) => row.id) },
          {
            onSuccess: () => {
              message.success("삭제되었습니다.");
            },
            onError: () => {
              message.error("삭제할 수 없습니다.");
            },
          }
        );
      },
      okText: "삭제",
      cancelText: "취소",
    });
  };

  return (
    <>
      <Button
        style={{ float: "right" }}
        type='primary'
        disabled={isLoading}
        onClick={() =>
          createResult(undefined, {
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
        datas={product?.content || []}
        total={product?.totalElements ?? 0}
        openModal={openModal}
        onRemove={onRemove}
        add={onAdd}
        edit={onEdit}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
        name={name}
        setName={setName}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: product?.totalElements ?? 0,
          onChange: (_page, _size) => {
            setPage(_page - 1);
            setSize(_size);
          },
        }}
      />
    </>
  );
}
