import { act, fireEvent, render, screen } from "@testing-library/react";
import { Form, FormInstance, InputNumber } from "antd";
import { UnitInputNumber } from "@/components/common/UnitInputNumber";
import { ComponentRef, createRef } from "react";

function setupPriceForm() {
  const formRef = createRef<FormInstance>();
  render(
    <Form ref={formRef}>
      <Form.Item
        name='price'
        label='시세'
        rules={[{ required: true, message: "시세를 입력해주세요" }]}
      >
        <UnitInputNumber unit='골드' min={0} />
      </Form.Item>
    </Form>
  );
  return formRef;
}

describe("UnitInputNumber", () => {
  it("Form.Item 안에서 값을 주고받고 단위를 함께 보여 준다", () => {
    const formRef = setupPriceForm();

    const input = screen.getByLabelText("시세");
    fireEvent.change(input, { target: { value: "120" } });

    expect(formRef.current?.getFieldValue("price")).toBe(120);
    expect(screen.getByText("골드")).toBeInTheDocument();
    // ref도 실제 입력으로 이어진다(getFieldInstance 등)
    expect(formRef.current?.getFieldInstance("price")).toBeTruthy();
  });

  it("ref를 prop으로 받아 실제 입력 요소에 연결한다", () => {
    const ref = createRef<ComponentRef<typeof InputNumber>>();
    render(<UnitInputNumber unit='개' ref={ref} aria-label='개수' />);

    act(() => ref.current?.focus());
    expect(screen.getByLabelText("개수")).toHaveFocus();
  });

  it("검증에 실패하면 입력을 오류 상태로 표시한다", async () => {
    const formRef = setupPriceForm();

    await act(async () => {
      await formRef.current?.validateFields().catch(() => {});
    });

    expect(await screen.findByText("시세를 입력해주세요")).toBeInTheDocument();
    expect(screen.getByLabelText("시세")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
});
