import { ReactNode, useId } from "react";
import { cx } from "./cx";
import { useFieldControl } from "./Field";
import styles from "./Form.module.css";

interface SegmentedProps<V> {
  // 어떤 옵션과도 같지 않으면 아무것도 선택하지 않는다
  value: V | undefined;
  onChange: (value: V) => void;
  options: readonly { value: V; label: ReactNode }[];
  "aria-label"?: string;
  disabled?: boolean;
  className?: string;
}

// 하나를 고르는 칸 묶음. 네이티브 라디오라 화살표 키로 옮겨 다닌다.
// 값은 옵션 순서로 대응해 boolean 등 문자열이 아닌 값도 쓸 수 있다.
export function Segmented<V>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  disabled,
  className,
}: SegmentedProps<V>) {
  const nameId = useId();
  const { labelId, invalid, props } = useFieldControl({});

  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : labelId}
      aria-describedby={props["aria-describedby"]}
      aria-invalid={props["aria-invalid"]}
      aria-required={props["aria-required"]}
      className={cx(styles.segmented, invalid && styles.invalid, className)}
    >
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <label
            key={String(option.value)}
            className={cx(
              styles.segment,
              checked && styles.selected,
              disabled && styles.segmentDisabled
            )}
          >
            <input
              type='radio'
              className='ui-sr-only'
              name={nameId}
              value={index}
              checked={checked}
              disabled={disabled}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
