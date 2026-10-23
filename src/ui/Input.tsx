import {
  InputHTMLAttributes,
  Ref,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useFieldControl } from "./Field";
import { styles } from "./Form.styles";
import { CloseIcon, EyeIcon, EyeOffIcon } from "./icons";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size" | "prefix"
> & {
  value?: string;
  onChange?: (value: string) => void;
  // 값이 있을 때 지우기 버튼을 보인다
  allowClear?: boolean;
  ref?: Ref<HTMLInputElement>;
};

// 글자 입력. className·style은 테두리 상자에, 나머지 속성은 input에 붙는다.
// type="password"면 보기/숨기기 버튼을 함께 둔다.
export function Input({
  value,
  onChange,
  allowClear,
  type,
  className,
  style,
  ref,
  ...rest
}: InputProps) {
  const field = useFieldControl(rest);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const showClear = allowClear && !!value && !rest.disabled && !rest.readOnly;

  return (
    <span
      css={[
        styles.control,
        field.invalid && styles.invalid,
        rest.disabled && styles.disabled,
      ]}
      className={className}
      style={style}
    >
      <input
        {...rest}
        {...field.props}
        ref={inputRef}
        type={isPassword && revealed ? "text" : type}
        value={value}
        css={styles.input}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {showClear && (
        <button
          type='button'
          css={styles.affix}
          aria-label='지우기'
          onClick={() => {
            onChange?.("");
            inputRef.current?.focus();
          }}
        >
          <CloseIcon />
        </button>
      )}
      {isPassword && (
        <button
          type='button'
          css={styles.affix}
          aria-label={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
          disabled={rest.disabled}
          onClick={() => setRevealed((prev) => !prev)}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </span>
  );
}
