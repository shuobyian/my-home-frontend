import { Ref, SelectHTMLAttributes } from "react";
import { useFieldControl } from "./Field";
import { styles } from "./Form.styles";

export type SelectProps<V extends string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "value" | "onChange"
> & {
  value?: V;
  onChange?: (value: V) => void;
  options: readonly { value: V; label: string }[];
  // 값이 없을 때 보이는 안내(고를 수 없는 빈 option)
  placeholder?: string;
  ref?: Ref<HTMLSelectElement>;
};

// 네이티브 select. 화살표만 CSS로 그린다.
export function Select<V extends string>({
  value,
  onChange,
  options,
  placeholder,
  className,
  ref,
  ...rest
}: SelectProps<V>) {
  const field = useFieldControl(rest);
  const empty = value === undefined || value === "";

  return (
    <select
      {...rest}
      {...field.props}
      ref={ref}
      value={value ?? ""}
      css={[
        styles.select,
        empty && placeholder !== undefined && styles.placeholder,
      ]}
      className={className}
      onChange={(event) => onChange?.(event.target.value as V)}
    >
      {placeholder !== undefined && (
        <option value='' disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
