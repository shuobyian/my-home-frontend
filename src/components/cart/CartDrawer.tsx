import { DeleteOutlined } from "@ant-design/icons";
import { Button, Drawer, InputNumber, Space, Typography } from "antd";
import { ROUTES } from "@/app/routes";
import { CartEntryList } from "@/components/cart/CartEntryList";
import { CART_SOURCE_LABEL } from "@/domain/cart";
import { formatGold } from "@/lib/format";
import { useNavigate } from "react-router";
import { useCart } from "@/state/cart";

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
      title='장바구니'
      extra={
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={clear}
          disabled={entries.length === 0}
        >
          전체 삭제
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
        <CartEntryList
          entries={entries}
          emptyText='담긴 물품이 없습니다.'
          renderDescription={({ key, source, item, count }) => (
            <Space orientation='vertical' style={{ width: "100%" }}>
              <Typography.Text type='secondary'>
                {CART_SOURCE_LABEL[source]} · 재료비{" "}
                {formatGold(item.totalPrice)}
              </Typography.Text>
              <Space style={{ width: "100%", justifyContent: "space-between" }}>
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
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`${item.name} 삭제`}
                  onClick={() => remove(key)}
                />
              </Space>
            </Space>
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
