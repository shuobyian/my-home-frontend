import { Divider, Modal, Typography, message } from "antd";
import { getErrorMessage } from "apis/errors";
import { useCreateProductsMutation } from "queries/product";
import { useRef, useState } from "react";
import { Product } from "types/product";
import { STORAGE_KEY } from "lib/storage";
import { ExcelButton } from "view/components/manage/ExcelButton";
import ProductTableView from "view/components/manage/ProductTableView";

const DEFAULT_DATA = localStorage.getItem(STORAGE_KEY.PRODUCT);

export default function RawProductTable() {
  const { mutate: upload } = useCreateProductsMutation();

  const defaultDatas = DEFAULT_DATA ? JSON.parse(DEFAULT_DATA) : [];
  const originalDatas = useRef<Product[]>(defaultDatas);
  const [datas, setDatas] = useState<Product[]>(defaultDatas);

  const [isModalOpened, setIsModalOpened] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Product>();
  const [selectedRows, setSelectedRows] = useState<Product[]>([]);

  const openModal = () => {
    setIsModalOpened(true);
  };

  const add = (data: Omit<Product, "id">) => {
    setDatas((prev) => [{ ...data, id: (datas.at(-1)?.id ?? 0) + 1 }, ...prev]);
    message.success("추가되었습니다");
  };

  const edit = (data: Product) => {
    setDatas((prevs) =>
      prevs.map((prev) => (prev.id === data.id ? data : prev))
    );
    message.success("수정되었습니다");
  };

  const remove = () => {
    setDatas((prevs) =>
      prevs.filter((prev) => !selectedRows.find((row) => row.id === prev.id))
    );
    setSelectedRows([]);
    message.success("삭제되었습니다");
  };

  const onRemove = () => {
    Modal.confirm({
      title: "삭제하시겠습니까?",
      content: (
        <ul style={{ maxHeight: 400, overflow: "scroll" }}>
          {selectedRows.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      ),
      onOk: remove,
      okText: "삭제",
      cancelText: "취소",
    });
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY.PRODUCT, JSON.stringify(datas));

    upload(
      { products: datas },
      {
        onSuccess: (data) => {
          Modal.info({
            title: "저장되었습니다.",
            content: (
              <ul style={{ maxHeight: 400, overflow: "scroll" }}>
                {data.map(({ id, name }) => (
                  <li key={id}>{name}</li>
                ))}
              </ul>
            ),
            okText: "확인",
          });
        },
        onError: (error) => {
          message.error(getErrorMessage(error));
        },
      }
    );
  };

  const onSave = () => {
    const changeDatas = datas.filter(
      (data) => !originalDatas.current.find(({ name }) => name === data.name)
    );

    Modal.confirm({
      title: "저장하시겠습니까?",
      content: (
        <ul style={{ maxHeight: 400, overflow: "scroll" }}>
          {changeDatas.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      ),
      onOk: save,
      okText: "확인",
      cancelText: "취소",
    });
  };

  return (
    <>
      <Typography.Title level={4}>Raw 엑셀 데이터</Typography.Title>
      <ProductTableView
        datas={datas}
        total={datas.length}
        openModal={openModal}
        onRemove={onRemove}
        onSave={onSave}
        add={add}
        edit={edit}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        isModalOpened={isModalOpened}
        setIsModalOpened={setIsModalOpened}
      />
      <Divider type='horizontal' />
      <ExcelButton
        originalDatas={originalDatas}
        datas={datas}
        setDatas={setDatas}
      />
    </>
  );
}
