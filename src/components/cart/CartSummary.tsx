import { Avatar, Button, Collapse, Empty, List, Space, Typography } from "antd";
import { ROUTES } from "app/routes";
import { MaterialTable } from "components/result/MaterialTable";
import { CART_SOURCE_LABEL, sumPrice } from "domain/cart";
import { formatGold, formatNumber } from "lib/format";
import { useNavigate } from "react-router-dom";
import { useCart } from "state/cart";

// 장바구니에 담긴 물품과 기초 재료 합산 결과
export function CartSummary() {
  const navigate = useNavigate();
  const { entries, totalCount, materials } = useCart();
  const totalPrice = sumPrice(materials);

  return (
    <div style={{ width: "100%" }}>
      <Typography.Title level={3}>물품 합산 결과</Typography.Title>
      <Typography.Title level={5}>
        담긴 물품은 삭제하기 전까지 유지됩니다.
      </Typography.Title>
      {entries.length === 0 ? (
        <Empty description='장바구니에 담긴 물품이 없습니다.'>
          <Button type='primary' onClick={() => navigate(ROUTES.HOME)}>
            물품 담으러 가기
          </Button>
        </Empty>
      ) : (
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Text type='secondary'>
            가격은 물품을 담은 시점의 시세로 계산됩니다.
          </Typography.Text>
          <Collapse
            items={[
              {
                key: "1",
                label: (
                  <Typography.Text>
                    담긴 물품 (
                    <Typography.Text>
                      {formatNumber(totalCount)}개
                    </Typography.Text>
                    )
                  </Typography.Text>
                ),
                children: (
                  <div style={{ maxHeight: "300px", overflow: "auto" }}>
                    <List
                      itemLayout='horizontal'
                      dataSource={entries}
                      renderItem={({ key, source, item, count }) => (
                        <List.Item key={key}>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                size='large'
                                src={`${process.env.PUBLIC_URL}/images/${item.name}.jpg`}
                              />
                            }
                            title={item.name}
                            description={`${formatNumber(count)}개 · ${
                              CART_SOURCE_LABEL[source]
                            }`}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ),
              },
            ]}
          />
          <Space direction='vertical' style={{ width: "100%" }}>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Typography.Text strong>기초 재료</Typography.Text>
              <Typography.Text strong>
                총 {formatGold(totalPrice)}
              </Typography.Text>
            </Space>
            <MaterialTable materials={materials} />
          </Space>
        </Space>
      )}
    </div>
  );
}
