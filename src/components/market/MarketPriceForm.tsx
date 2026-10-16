import { Button, Form, Input, InputNumber, Space, Table } from "antd";
import { useEffect, useRef } from "react";
import { Market } from "@/types/market";

interface MarketFormValues {
  markets: Market[];
}

interface MarketPriceFormProps {
  // 서버 시세. '시세 불러오기'와, 초기값이 없을 때 처음 채우는 데 쓴다.
  // 캐시에 남은 오래된 값으로 채우지 않도록 마운트 후 새로 받은 값만 넘긴다(isFetchedAfterMount)
  serverMarkets?: Market[];
  // 처음 채울 값(예: 브라우저에 저장해 둔 시세). 있으면 서버 시세보다 우선한다
  initialMarkets?: Market[];
  // 서버에 저장하는 화면은 정수 시세를 필수로 받는다(PUT /market 규칙)
  requirePrice?: boolean;
  submitText: string;
  submitting?: boolean;
  onSubmit: (markets: Market[]) => void;
}

// 재료 시세 입력 표
export function MarketPriceForm({
  serverMarkets,
  initialMarkets,
  requirePrice = false,
  submitText,
  submitting,
  onSubmit,
}: MarketPriceFormProps) {
  const [form] = Form.useForm<MarketFormValues>();

  // 처음 값이 준비되면 한 번만 채운다(이후 재조회가 입력 중인 값을 덮어쓰지 않도록)
  const filled = useRef(false);
  useEffect(() => {
    const markets = initialMarkets ?? serverMarkets;
    if (filled.current || !markets) return;
    form.setFieldsValue({ markets });
    filled.current = true;
  }, [form, initialMarkets, serverMarkets]);

  const loadServerMarkets = () => {
    if (serverMarkets) form.setFieldsValue({ markets: serverMarkets });
  };

  return (
    <Form
      form={form}
      initialValues={{ markets: [] }}
      onFinish={({ markets }) => onSubmit(markets ?? [])}
    >
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Button onClick={loadServerMarkets} disabled={!serverMarkets}>
          시세 불러오기
        </Button>
        <Button type='primary' htmlType='submit' loading={submitting}>
          {submitText}
        </Button>
      </Space>
      <Form.List name='markets'>
        {(fields) => (
          <Table
            rowKey='key'
            dataSource={fields}
            pagination={false}
            columns={[
              {
                title: "물품명",
                key: "name",
                render: (_, field) => (
                  <>
                    <Form.Item name={[field.name, "id"]} hidden>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[field.name, "name"]} noStyle>
                      <Input disabled />
                    </Form.Item>
                  </>
                ),
              },
              {
                title: "시세",
                key: "price",
                render: (_, field) => (
                  <Form.Item
                    name={[field.name, "price"]}
                    style={{ margin: 0 }}
                    rules={
                      requirePrice
                        ? [{ required: true, message: "시세를 입력해주세요" }]
                        : []
                    }
                  >
                    <InputNumber
                      min={0}
                      precision={requirePrice ? 0 : undefined}
                      inputMode={requirePrice ? "numeric" : "decimal"}
                      addonAfter='골드'
                    />
                  </Form.Item>
                ),
              },
            ]}
          />
        )}
      </Form.List>
    </Form>
  );
}
