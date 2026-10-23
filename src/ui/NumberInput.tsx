import {
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  Ref,
  useState,
} from "react";
import { cx } from "./cx";
import { useFieldControl } from "./Field";
import styles from "./Form.module.css";

export type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "value"
  | "onChange"
  | "type"
  | "min"
  | "max"
  | "step"
  | "defaultValue"
  | "size"
  | "prefix"
> & {
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  // 소수 자릿수. 벗어날 때와 ↑/↓에서 이 자릿수로 반올림한다
  precision?: number;
  // 오른쪽에 붙이는 단위(골드, 개 등)
  suffix?: ReactNode;
  align?: "start" | "center";
  ref?: Ref<HTMLInputElement>;
};

const NUMBER_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

// 빈 글자는 null, 숫자로 읽을 수 없으면(입력 중인 "-" 등) undefined.
// 쉼표·공백·단위 글자("12,500골드")는 지우고 읽는다(antd 기본 파서와 같은 규칙)
function parse(text: string) {
  const cleaned = text.replace(/[^\w.-]+/g, "");
  if (cleaned === "") return null;
  return NUMBER_PATTERN.test(cleaned) ? Number(cleaned) : undefined;
}

const format = (value: number | null | undefined) =>
  value == null ? "" : String(value);

// 숫자 입력. 입력 중에는 읽은 숫자를 그대로 알리고,
// 벗어날 때 범위로 고정하고 자릿수로 반올림한다.
export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  precision,
  suffix,
  align = "start",
  inputMode,
  className,
  style,
  onBlur,
  onKeyDown,
  ref,
  ...rest
}: NumberInputProps) {
  const field = useFieldControl(rest);
  // value를 넘기지 않으면 안에서 값을 들고 있는다
  const [innerValue, setInnerValue] = useState(value ?? null);
  const current = value === undefined ? innerValue : value;
  const [text, setText] = useState(() => format(current));
  const [prevValue, setPrevValue] = useState(current);
  // 값이 바뀌어 지금 글자와 뜻이 다를 때만 글자를 맞춘다(입력 중인 "1." 등은 그대로 둔다).
  // NaN이 와도 렌더가 반복되지 않게 Object.is로 비교한다
  if (!Object.is(current, prevValue)) {
    setPrevValue(current);
    if (parse(text) !== current) setText(format(current));
  }

  const emit = (next: number | null) => {
    setInnerValue(next);
    onChange?.(next);
  };

  // ponytail: toFixed 반올림이라 0.1 단위 step 등에서 부동소수 오차가 남을 수 있다. 필요해지면 십진 연산으로 바꾼다
  const normalize = (n: number) => {
    const rounded = precision === undefined ? n : Number(n.toFixed(precision));
    return Math.min(Math.max(rounded, min ?? -Infinity), max ?? Infinity);
  };

  const handleChange = (next: string) => {
    const parsed = parse(next);
    if (parsed !== undefined && parsed !== parse(text)) emit(parsed);
    setText(next);
  };

  // 글자를 범위·자릿수로 정리해 확정한다. 읽을 수 없는 글자면 현재 값으로 되돌린다
  const commit = () => {
    const parsed = parse(text);
    if (typeof parsed === "number") {
      const fixed = normalize(parsed);
      if (fixed !== current) emit(fixed);
      setText(format(fixed));
    } else {
      setText(format(current));
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    commit();
    onBlur?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (rest.disabled || rest.readOnly) return;
    // Enter로 폼을 제출하기 전에 확정한다(제출은 막지 않는다)
    if (event.key === "Enter") {
      commit();
      return;
    }
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    const next = normalize(
      (current ?? 0) + (event.key === "ArrowUp" ? step : -step)
    );
    setText(format(next));
    if (next !== current) emit(next);
  };

  return (
    <span
      className={cx(
        styles.number,
        suffix != null && styles.hasSuffix,
        className
      )}
      style={style}
    >
      <span
        className={cx(
          styles.control,
          field.invalid && styles.invalid,
          rest.disabled && styles.disabled
        )}
      >
        <input
          autoComplete='off'
          {...rest}
          {...field.props}
          ref={ref}
          type='text'
          role='spinbutton'
          inputMode={inputMode ?? (precision === 0 ? "numeric" : "decimal")}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={current ?? undefined}
          value={text}
          className={cx(styles.input, align === "center" && styles.center)}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </span>
      {suffix != null && <span className={styles.addon}>{suffix}</span>}
    </span>
  );
}
