import { Avatar, Collapse, List, Space, Typography } from "antd";
import { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { aggregateMaterials, Cart, sumPrice } from "domain/cart";
import { formatGold, formatNumber } from "lib/format";
import { MaterialTable } from "view/components/shared/MaterialTable";

const EMPTY_RESULTS: Cart = {};

export function CalculationList() {
  // 주소로 직접 들어오면 state가 없다. 이때는 홈으로 돌려보낸다.
  const { state } = useLocation() as {
    state: { selectedResults?: Cart; totalCount?: number } | null;
  };
  const selectedResults = state?.selectedResults ?? EMPTY_RESULTS;
  const totalCount = state?.totalCount ?? 0;

  const itemList = useMemo(
    () => Object.values(selectedResults),
    [selectedResults]
  );

  // 기초 재료 합산은 한 번만 계산해 총액과 표에 함께 쓴다
  const materials = useMemo(
    () => aggregateMaterials(selectedResults),
    [selectedResults]
  );
  const totalPrice = sumPrice(materials);

  if (!state?.selectedResults) return <Navigate to='/' replace />;

  return (
    <div style={{ width: "100%" }}>
      <Typography.Title level={3}>물품 합산 결과</Typography.Title>
      <Typography.Title level={5}>
        담긴 물품은 삭제하기 전까지 유지됩니다.
      </Typography.Title>
      <Space direction='vertical' style={{ width: "100%" }}>
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
                          description={<div>{formatNumber(count)}개</div>}
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
    </div>
  );
}
