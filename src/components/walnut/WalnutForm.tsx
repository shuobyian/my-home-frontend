import { Button, Form, InputNumber } from "antd";
import {
  DEFAULT_PRODUCTION_PERCENT,
  MAX_LEVEL,
  WALNUT_MIN_LEVEL,
} from "domain/experience";
import { useEffect } from "react";
import { WalnutParams } from "types/experience";

interface WalnutFormProps {
  // 마지막으로 계산한 조건(URL). 바뀌면 입력창도 맞춘다
  initialValues?: WalnutParams;
  loading?: boolean;
  onSubmit: (params: WalnutParams) => void;
}

const EMPTY: Partial<WalnutParams> = {
  presentLevel: undefined,
  presentExperience: undefined,
  objectiveLevel: undefined,
  productionPercent: undefined,
};

export function WalnutForm({
  initialValues,
  loading,
  onSubmit,
}: WalnutFormProps) {
  const [form] = Form.useForm<WalnutParams>();
  const presentLevel = Form.useWatch("presentLevel", form);

  useEffect(() => {
    form.setFieldsValue({ ...EMPTY, ...initialValues });
  }, [form, initialValues]);

  // 입력하지 않은 선택 항목은 보내지 않는다(서버 기본값 사용)
  const submit = (values: WalnutParams) => {
    const params = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== undefined && value !== null
      )
    ) as unknown as WalnutParams;
    onSubmit(params);
  };

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={submit}
      style={{ maxWidth: 420 }}
    >
      <Form.Item
        name='presentLevel'
        label='현재 레벨 (필수)'
        rules={[
          { required: true, message: "현재 레벨을 입력해주세요." },
          { type: "integer", message: "정수로 입력해주세요." },
          {
            type: "number",
            min: WALNUT_MIN_LEVEL,
            max: MAX_LEVEL - 1,
            message: `현재 레벨은 ${WALNUT_MIN_LEVEL}~${MAX_LEVEL - 1} 사이여야 합니다.`,
          },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          precision={0}
          inputMode='numeric'
          placeholder='현재 레벨'
        />
      </Form.Item>
      <Form.Item
        name='presentExperience'
        label='현재 경험치'
        extra='입력하지 않으면 0으로 계산됩니다.'
        rules={[
          { type: "integer", message: "정수로 입력해주세요." },
          { type: "number", min: 0, message: "0 이상으로 입력해주세요." },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          precision={0}
          inputMode='numeric'
          placeholder='기본값 = 0'
        />
      </Form.Item>
      <Form.Item
        name='objectiveLevel'
        label='목표 레벨'
        extra='입력하지 않으면 다음 레벨로 설정됩니다.'
        dependencies={["presentLevel"]}
        rules={[
          ({ getFieldValue }) => ({
            validator: (_, value?: number) => {
              const present = getFieldValue("presentLevel");
              if (value === undefined || value === null)
                return Promise.resolve();
              if (typeof present === "number" && value <= present) {
                return Promise.reject(
                  new Error("목표 레벨은 현재 레벨보다 커야 합니다.")
                );
              }
              if (value > MAX_LEVEL) {
                return Promise.reject(
                  new Error(`목표 레벨은 ${MAX_LEVEL} 이하여야 합니다.`)
                );
              }
              return Promise.resolve();
            },
          }),
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          precision={0}
          inputMode='numeric'
          placeholder={`기본값 = ${
            typeof presentLevel === "number"
              ? presentLevel + 1
              : "현재 레벨 + 1"
          }`}
        />
      </Form.Item>
      <Form.Item
        name='productionPercent'
        label='생산 경험치 버프 비율(%)'
        extra='예) 20%일 경우 20'
        rules={[
          {
            type: "number",
            min: 0,
            max: 100,
            message: "0~100 사이로 입력해주세요.",
          },
        ]}
      >
        <InputNumber
          style={{ width: "100%" }}
          inputMode='decimal'
          placeholder={`기본값 = ${DEFAULT_PRODUCTION_PERCENT}`}
        />
      </Form.Item>
      <Button type='primary' htmlType='submit' loading={loading}>
        계산하기
      </Button>
    </Form>
  );
}
