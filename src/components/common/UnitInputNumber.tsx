import { InputNumber, InputNumberProps, Space } from "antd";

interface UnitInputNumberProps extends InputNumberProps<number> {
  // 입력 오른쪽에 붙일 단위(골드, 개 등)
  unit: string;
}

// 단위를 붙인 숫자 입력. Form.Item 안에서 InputNumber처럼 쓴다(값·onChange를 그대로 넘긴다).
// antd 5.29부터 InputNumber의 addonAfter가 폐기 예정이라 Space.Compact로 붙인다.
export function UnitInputNumber({ unit, ...props }: UnitInputNumberProps) {
  return (
    <Space.Compact>
      <InputNumber {...props} />
      <Space.Addon>{unit}</Space.Addon>
    </Space.Compact>
  );
}
