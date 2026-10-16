import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
} from "antd";
import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "domain/labels";
import { MAX_MATERIAL_SLOTS } from "domain/productExcel";
import { useState } from "react";
import { Product, ProductCreateRequest } from "types/product";

// 서버는 물품명·재료명에 쉼표를 허용하지 않는다(결과의 재료 목록을 쉼표로 저장)
const NO_COMMA_RULE = {
  pattern: /^[^,]*$/,
  message: "이름에 쉼표(,)는 쓸 수 없습니다",
};

interface ProductModalProps {
  // 수정할 물품. 없으면 추가 모드
  product?: Product;
  // 실패하면 reject한다. 이때 입력값을 유지하도록 모달을 닫지 않는다.
  onSubmit: (value: Product | ProductCreateRequest) => Promise<void>;
  onClose: () => void;
}

// 열 때마다 새로 마운트해서 사용한다(초기값은 마운트 시점에 한 번 적용)
export function ProductModal({
  product,
  onSubmit,
  onClose,
}: ProductModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<Product>();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    let value: Product;
    try {
      value = await form.validateFields();
    } catch {
      message.error("정보를 다시 확인해주세요");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(value);
      onClose();
    } catch {
      // 실패 메시지는 호출부에서 보여 준다
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      width={700}
      title={product ? `${product.name} 정보 수정` : "물품 추가"}
      okText={product ? "수정" : "추가"}
      cancelText='취소'
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={submitting}
    >
      <Form
        form={form}
        initialValues={product ?? { materials: [{ basic: true }] }}
        style={{ margin: "30px 0" }}
      >
        <Form.Item hidden name='id'>
          <Input />
        </Form.Item>
        <Form.Item
          name='name'
          rules={[
            {
              required: true,
              whitespace: true,
              message: "물품명을 입력해주세요",
            },
            NO_COMMA_RULE,
          ]}
        >
          <Input placeholder='물품명' />
        </Form.Item>
        <Form.Item
          name='level'
          rules={[{ required: true, message: "레벨을 입력해주세요" }]}
        >
          <InputNumber
            style={{ width: 120 }}
            min={0}
            max={200}
            placeholder='레벨'
          />
        </Form.Item>
        <Form.Item
          name='craftingPrice'
          rules={[{ required: true, message: "크래프팅 가격을 입력해주세요" }]}
        >
          <InputNumber min={0} addonAfter='골드' placeholder='크래프팅 가격' />
        </Form.Item>
        <Form.Item
          name='tool'
          rules={[{ required: true, message: "도구를 선택해주세요" }]}
        >
          <Select options={TOOL_OPTIONS} placeholder='도구' />
        </Form.Item>
        <Form.Item
          name='category'
          rules={[{ required: true, message: "카테고리를 선택해주세요" }]}
        >
          <Select options={CATEGORY_OPTIONS} placeholder='카테고리' />
        </Form.Item>
        <Space direction='vertical'>
          <Typography.Text>
            필요 재료 (최대 {MAX_MATERIAL_SLOTS}개)
          </Typography.Text>
          <Form.List name='materials'>
            {(fields, { add: addMaterial, remove: removeMaterial }) => (
              <Space direction='vertical'>
                {fields.map((field, index) => (
                  <Space direction='horizontal' key={field.key}>
                    <Form.Item
                      style={{ margin: 0 }}
                      name={[field.name, "name"]}
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "물품명을 입력해주세요",
                        },
                        NO_COMMA_RULE,
                      ]}
                    >
                      <Input placeholder='물품명' />
                    </Form.Item>
                    <Form.Item
                      style={{ margin: 0 }}
                      name={[field.name, "basic"]}
                      rules={[
                        {
                          required: true,
                          message: "하위재료 여부를 선택해주세요",
                        },
                      ]}
                    >
                      <Radio.Group
                        optionType='button'
                        options={[
                          { value: false, label: "하위재료 O" },
                          { value: true, label: "최하위재료" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ margin: 0 }}
                      name={[field.name, "count"]}
                      rules={[
                        { required: true, message: "개수를 입력해주세요" },
                        {
                          type: "number",
                          validator: (_, value) =>
                            value === undefined || value === null || value > 0
                              ? Promise.resolve()
                              : Promise.reject(
                                  new Error("개수는 0보다 커야 합니다")
                                ),
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: 120 }}
                        min={0}
                        max={100}
                        addonAfter='개'
                        placeholder='개수'
                      />
                    </Form.Item>
                    {index > 0 && (
                      <Button onClick={() => removeMaterial(field.name)}>
                        -
                      </Button>
                    )}
                    {index === fields.length - 1 &&
                      fields.length < MAX_MATERIAL_SLOTS && (
                        <Button onClick={() => addMaterial({ basic: true })}>
                          +
                        </Button>
                      )}
                  </Space>
                ))}
              </Space>
            )}
          </Form.List>
        </Space>
      </Form>
    </Modal>
  );
}
