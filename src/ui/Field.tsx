import {
  AriaAttributes,
  createContext,
  CSSProperties,
  ReactNode,
  use,
  useId,
} from "react";
import { styles } from "./Form.styles";

interface FieldContextValue {
  id: string;
  labelId: string;
  describedBy?: string;
  invalid?: true;
  required?: true;
}

// 없어도 된다: 컨트롤은 Field 밖에서도 단독으로 동작한다
const FieldContext = createContext<FieldContextValue | null>(null);

interface FieldProps {
  label: ReactNode;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  // 라벨 줄(별표 포함)을 화면에서만 숨긴다. 접근 이름과 aria-required는 그대로 붙는다.
  hideLabel?: boolean;
  // 라벨을 컨트롤 왼쪽에 둔다(좁은 카드 등 세로 공간을 아낄 때)
  inline?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

// 라벨(위)·컨트롤·오류·도움말 묶음. 안쪽 DS 컨트롤에 id와 aria 속성을 context로 넘긴다.
// 바깥 여백은 없다: 세로로 쌓을 때는 Form, 한 줄에 놓을 때는 FieldRow로 간격을 준다.
export function Field({
  label,
  help,
  error,
  required,
  hideLabel,
  inline,
  children,
  className,
  style,
}: FieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  const describedBy =
    [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div
      css={[styles.field, inline && styles.inlineField]}
      className={className}
      style={style}
    >
      {/* 숨길 때는 전역 ui-sr-only만 붙인다(라벨 여백이 숨김 규칙의 padding: 0을 이기지 않게) */}
      <div
        css={
          hideLabel ? undefined : [styles.label, inline && styles.inlineLabel]
        }
        className={hideLabel ? "ui-sr-only" : undefined}
      >
        {/* 라벨 글자(접근 이름)에 섞이지 않도록 label 밖에 둔다 */}
        {required && (
          <span css={styles.required} aria-hidden='true'>
            *
          </span>
        )}
        <label id={labelId} htmlFor={id}>
          {label}
        </label>
      </div>
      <FieldContext
        value={{
          id,
          labelId,
          describedBy,
          invalid: error ? true : undefined,
          required: required || undefined,
        }}
      >
        {children}
      </FieldContext>
      {error && (
        <div
          id={errorId}
          role='alert'
          css={[styles.error, inline && styles.inlineMessage]}
        >
          {error}
        </div>
      )}
      {help && (
        <div id={helpId} css={[styles.help, inline && styles.inlineMessage]}>
          {help}
        </div>
      )}
    </div>
  );
}

interface ControlAria {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-required"?: AriaAttributes["aria-required"];
}

// 컨트롤 쪽 헬퍼. Field 안이면 그 id·aria 속성을 붙이되 호출부가 직접 넘긴 값이 우선한다.
// id만은 Field 것이 우선한다(라벨의 htmlFor와 어긋나면 접근 이름이 사라진다).
export function useFieldControl(own: ControlAria) {
  const field = use(FieldContext);
  const props = {
    id: field?.id ?? own.id,
    "aria-describedby": own["aria-describedby"] ?? field?.describedBy,
    "aria-invalid": own["aria-invalid"] ?? field?.invalid,
    "aria-required": own["aria-required"] ?? field?.required,
  };
  return {
    labelId: field?.labelId,
    invalid: props["aria-invalid"] === true || props["aria-invalid"] === "true",
    props,
  };
}
