import { TextareaHTMLAttributes } from "react";
import { useFieldControl } from "./Field";
import { styles } from "./Form.styles";

export type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
};

// 여러 줄 글자 입력. 테두리 상자 없이 textarea 하나라 className·style도 여기에 붙는다
export function TextArea({ value, onChange, ...rest }: TextAreaProps) {
  const field = useFieldControl(rest);
  return (
    <textarea
      {...rest}
      {...field.props}
      value={value}
      css={[
        styles.control,
        styles.textArea,
        field.invalid && styles.invalid,
        rest.disabled && styles.disabled,
      ]}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}
