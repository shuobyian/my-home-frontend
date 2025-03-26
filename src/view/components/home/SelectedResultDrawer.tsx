import { DeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Drawer, DrawerProps, List, Space } from "antd";
import { Result } from "apis/result/getResults";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorageResult } from "util/hook/useSelectedResults";

interface SelectedResultDrawerProps extends DrawerProps {
  selectedResults: StorageResult;
  totalCount: number;
  add: (id: number) => void;
  sub: (id: number) => void;
  remove: (id: number) => void;
  removeAll: () => void;
  backup: (results: StorageResult) => void;
}

export function SelectedResultDrawer({
  selectedResults,
  totalCount,
  add,
  sub,
  remove,
  removeAll,
  backup,
  ...props
}: SelectedResultDrawerProps) {
  const navigate = useNavigate();

  const [itemList, setItemList] = useState<{ item: Result; count: number }[]>(
    []
  );

  useEffect(() => {
    setItemList(Object.values(selectedResults));
  }, [selectedResults]);

  return (
    <Drawer
      title={
        <Button style={{ float: "right" }} onClick={() => removeAll()}>
          <DeleteOutlined style={{ color: "red" }} /> 전체 삭제
        </Button>
      }
      {...props}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          padding: "10px",
          overflow: "auto",
        }}
      >
        <List
          itemLayout='horizontal'
          dataSource={itemList}
          renderItem={({ item, count }) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    size='large'
                    src={`${process.env.PUBLIC_URL}/images/${item.name}.jpg`}
                  />
                }
                title={item.name}
                description={
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Space>
                      <Button onClick={() => sub(item.id)}>-</Button>
                      <div>{count}</div>
                      <Button onClick={() => add(item.id)}>+</Button>
                    </Space>
                    <Button onClick={() => remove(item.id)}>
                      <DeleteOutlined style={{ color: "red" }} />
                    </Button>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        <Button
          onClick={() => {
            navigate("/calculation", {
              state: { selectedResults, totalCount },
            });
            backup(selectedResults);
          }}
        >
          합산
        </Button>
      </div>
    </Drawer>
  );
}
