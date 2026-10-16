import { DeleteOutlined } from "@ant-design/icons";
import { Button, Drawer, InputNumber, List, Space, Typography } from "antd";
import { ROUTES } from "app/routes";
import { ItemImage } from "components/common/ItemImage";
import { CART_SOURCE_LABEL } from "domain/cart";
import { formatGold } from "lib/format";
import { useNavigate } from "react-router-dom";
import { useCart } from "state/cart";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { entries, increment, decrement, setCount, remove, clear } = useCart();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <Button
          style={{ float: "right" }}
          onClick={clear}
          disabled={entries.length === 0}
        >
          <DeleteOutlined style={{ color: "red" }} /> 전체 삭제
        </Button>
      }
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
          dataSource={entries}
          locale={{ emptyText: "담긴 물품이 없습니다." }}
          renderItem={({ key, source, item, count }) => (
            <List.Item key={key}>
              <List.Item.Meta
                avatar={<ItemImage name={item.name} />}
                title={item.name}
                description={
                  <Space direction='vertical' style={{ width: "100%" }}>
                    <Typography.Text type='secondary'>
                      {CART_SOURCE_LABEL[source]} · 재료비{" "}
                      {formatGold(item.totalPrice)}
                    </Typography.Text>
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
                      <Space>
                        <Button onClick={() => decrement(key)}>-</Button>
                        <InputNumber
                          className='cart-count-input'
                          value={count}
                          min={1}
                          precision={0}
                          onChange={(value) => {
                            if (typeof value === "number") setCount(key, value);
                          }}
                        />
                        <Button onClick={() => increment(key)}>+</Button>
                      </Space>
                      <Button onClick={() => remove(key)}>
                        <DeleteOutlined style={{ color: "red" }} />
                      </Button>
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        <Button
          type='primary'
          disabled={entries.length === 0}
          onClick={() => {
            onClose();
            navigate(ROUTES.CALCULATION);
          }}
        >
          합산
        </Button>
      </div>
    </Drawer>
  );
}
