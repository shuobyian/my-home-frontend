import { FormEvent, useState } from "react";

// 경로("name", "materials.0.count")별 오류 메시지
export type FormErrors = Record<string, string | undefined>;

// 폼 값과 검증 오류. 오류는 첫 제출 시도 뒤부터 렌더마다 다시 계산해 보여 준다.
// 외부 값으로 다시 채워야 하면 호출부가 렌더 중에 이전 값과 비교해 setValues를 부른다
// (key로 다시 마운트하면 제출 뒤 포커스가 사라진다).
export function useForm<T extends object>(
  initialValues: T | (() => T),
  validate: (values: T) => FormErrors
) {
  const [values, setValues] = useState<T>(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const errors: FormErrors = submitted ? validate(values) : {};

  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit =
    (onValid: (values: T) => void, onInvalid?: (errors: FormErrors) => void) =>
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      const result = validate(values);
      if (Object.values(result).some(Boolean)) onInvalid?.(result);
      else onValid(values);
    };

  return { values, errors, set, setValues, handleSubmit };
}
