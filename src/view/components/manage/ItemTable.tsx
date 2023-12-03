import {
  Button,
  Divider,
  Modal,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { Item } from "apis/getItems";
import MyHomeError from "apis/lib/error/MyHomeError";
import { useUploadItemMutation } from "queries/useUploadItemMutation";
import { useRef, useState } from "react";
import { StringUtil } from "util/StringUtil";
import { ITEM } from "util/constant/LOCAL_STORAGE_KEY";
import { materialColumns } from "util/constant/materialColumns";
import { ExcelButton } from "view/components/manage/ExcelButton";
import { ItemModal } from "view/components/manage/modal/ItemModal";

const DEFAULT_DATA = localStorage.getItem(ITEM);

const columns: ColumnsType<Item> = materialColumns;

export default function ItemTable() {
  const { mutate: upload } = useUploadItemMutation();

  const defaultDatas = DEFAULT_DATA ? JSON.parse(DEFAULT_DATA) : [];
  const originalDatas = useRef<Item[]>(defaultDatas);
  const [datas, setDatas] = useState<Item[]>(defaultDatas);

  const [isModalOpened, setIsModalOpened] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Item>();
  const [selectedRows, setSelectedRows] = useState<Item[]>([]);

  const openModal = () => {
    setIsModalOpened(true);
  };

  const add = (data: Omit<Item, "id">) => {
    setDatas((prev) => [{ ...data, id: (datas.at(-1)?.id ?? 0) + 1 }, ...prev]);
    message.success("추가되었습니다");
  };

  const edit = (data: Item) => {
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
    localStorage.setItem(ITEM, JSON.stringify(datas));

    upload(
      { items: datas },
      {
        onSuccess: ({ data }) => {
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
          message.error((error as MyHomeError).getErrorMessage());
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
      <div style={{ width: "100%" }}>
        <Space direction='horizontal'>
          <Button onClick={openModal}>추가</Button>
          <Button onClick={onRemove} disabled={selectedRows.length < 1}>
            삭제
          </Button>
        </Space>
        <Button style={{ float: "right" }} onClick={onSave} type='primary'>
          저장
        </Button>
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
            총 물품 {StringUtil.numberWithCommas(datas.length)}개
          </Typography.Text>
        </div>
        <Table
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
            onSelect: (record: Item, selected: boolean) => {
              if (!selected) {
                setSelectedRows((prev) =>
                  prev.filter((p) => p.id !== record.id)
                );
              }
            },
            onChange: (_, records: Item[], { type }) => {
              if (type === "all") setSelectedRows(records);
              else {
                setSelectedRows((prev) =>
                  [...prev, ...records].reduce<Item[]>(
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
      <Divider type='horizontal' />
      <ExcelButton
        originalDatas={originalDatas}
        datas={datas}
        setDatas={setDatas}
      />
      {isModalOpened && (
        <ItemModal
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
