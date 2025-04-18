import { Avatar, Collapse, List, Space, Typography } from "antd";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { calculateItem } from "util/calculateItem";
import { StorageResult } from "util/hook/useSelectedResults";
import { StringUtil } from "util/StringUtil";
import { MaterialTable } from "view/components/shared/MaterialTable";

export function CalculationList() {
  const {
    state: { selectedResults, totalCount },
  } = useLocation() as {
    state: { selectedResults: StorageResult; totalCount: number };
  };

  const itemList = useMemo(
    () => Object.values(selectedResults),
    [selectedResults]
  );

  const totalPrice = useMemo(
    () =>
      calculateItem(selectedResults).reduce((acc, curr) => acc + curr.price, 0),
    [selectedResults]
  );

  return (
    <div style={{ width: "100%" }}>
      <Typography.Title level={3}>물품 합산 결과</Typography.Title>
      <Typography.Title level={5}>
        담긴 물품은 삭제하기 전까지 유지됩니다.
      </Typography.Title>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Collapse
          items={[
            {
              key: "1",
              label: (
                <Typography.Text>
                  담긴 물품 (
                  <Typography.Text>
                    {StringUtil.numberWithCommas(totalCount)}개
                  </Typography.Text>
                  )
                </Typography.Text>
              ),
              children: (
                <div style={{ maxHeight: "300px", overflow: "auto" }}>
                  <List
                    itemLayout="horizontal"
                    dataSource={itemList}
                    renderItem={({ item, count }) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              size="large"
                              src={`${process.env.PUBLIC_URL}/images/${item.name}.jpg`}
                            />
                          }
                          title={item.name}
                          description={
                            <div>{StringUtil.numberWithCommas(count)}개</div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
        <Space direction="vertical" style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Text strong>기초 재료</Typography.Text>
            <Typography.Text strong>
              총 {StringUtil.numberWithCommasAndMoney(totalPrice)}
            </Typography.Text>
          </Space>
          <MaterialTable materials={calculateItem(selectedResults)} />
        </Space>
      </Space>
    </div>
  );
}
