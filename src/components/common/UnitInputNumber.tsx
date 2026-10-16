import { InputNumber, InputNumberProps, Space } from "antd";
import { ComponentRef, forwardRef } from "react";

interface UnitInputNumberProps extends InputNumberProps<number> {
  // 입력 오른쪽에 붙일 단위(골드, 개 등)
  unit: string;
}

// 단위를 붙인 숫자 입력. Form.Item 안에서 InputNumber처럼 쓴다(값·onChange·ref를 그대로 넘긴다).
// antd 5.29부터 InputNumber의 addonAfter가 폐기 예정이라 Space.Compact로 붙인다.
export const UnitInputNumber = forwardRef<
  ComponentRef<typeof InputNumber>,
  UnitInputNumberProps
>(function UnitInputNumber({ unit, ...props }, ref) {
  return (
    <Space.Compact>
      <InputNumber ref={ref} {...props} />
      <Space.Addon>{unit}</Space.Addon>
    </Space.Compact>
  );
});
