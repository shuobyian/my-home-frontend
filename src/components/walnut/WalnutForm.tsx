import {
  DEFAULT_PRODUCTION_PERCENT,
  MAX_LEVEL,
  WALNUT_MIN_LEVEL,
} from "@/domain/experience";
import { WalnutParams } from "@/types/experience";
import { Button, Field, FormErrors, NumberInput, useForm } from "@/ui";

interface WalnutFormProps {
  // 처음 채울 값(마지막으로 계산한 조건, URL). 바뀌면 호출부가 key를 바꿔 다시 마운트한다
  initialValues?: WalnutParams;
  loading?: boolean;
  onSubmit: (params: WalnutParams) => void;
}

// 비운 입력은 null
type WalnutValues = Record<keyof WalnutParams, number | null>;

const toValues = (params?: WalnutParams): WalnutValues => ({
  presentLevel: params?.presentLevel ?? null,
  presentExperience: params?.presentExperience ?? null,
  objectiveLevel: params?.objectiveLevel ?? null,
  productionPercent: params?.productionPercent ?? null,
});

// 항목마다 첫 번째로 어긋난 규칙의 메시지를 보여 준다
function validate({
  presentLevel,
  presentExperience,
  objectiveLevel,
  productionPercent,
}: WalnutValues): FormErrors {
  const errors: FormErrors = {};

  if (presentLevel === null) errors.presentLevel = "현재 레벨을 입력해주세요.";
  else if (!Number.isInteger(presentLevel))
    errors.presentLevel = "정수로 입력해주세요.";
  else if (presentLevel < WALNUT_MIN_LEVEL || presentLevel > MAX_LEVEL - 1)
    errors.presentLevel = `현재 레벨은 ${WALNUT_MIN_LEVEL}~${MAX_LEVEL - 1} 사이여야 합니다.`;

  if (presentExperience !== null) {
    if (!Number.isInteger(presentExperience))
      errors.presentExperience = "정수로 입력해주세요.";
    else if (presentExperience < 0)
      errors.presentExperience = "0 이상으로 입력해주세요.";
  }

  if (objectiveLevel !== null) {
    if (presentLevel !== null && objectiveLevel <= presentLevel)
      errors.objectiveLevel = "목표 레벨은 현재 레벨보다 커야 합니다.";
    else if (objectiveLevel > MAX_LEVEL)
      errors.objectiveLevel = `목표 레벨은 ${MAX_LEVEL} 이하여야 합니다.`;
  }

  if (
    productionPercent !== null &&
    (productionPercent < 0 || productionPercent > 100)
  )
    errors.productionPercent = "0~100 사이로 입력해주세요.";

  return errors;
}

export function WalnutForm({
  initialValues,
  loading,
  onSubmit,
}: WalnutFormProps) {
  const { values, errors, set, handleSubmit } = useForm(
    () => toValues(initialValues),
    validate
  );

  // 입력하지 않은 선택 항목은 보내지 않는다(서버 기본값 사용)
  const submit = (submitted: WalnutValues) => {
    const params = Object.fromEntries(
      Object.entries(submitted).filter(([, value]) => value !== null)
    ) as unknown as WalnutParams;
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit(submit)} style={{ maxWidth: 420 }}>
      <Field label='현재 레벨 (필수)' required error={errors.presentLevel}>
        <NumberInput
          style={{ width: "100%" }}
          precision={0}
          placeholder='현재 레벨'
          value={values.presentLevel}
          onChange={(value) => set("presentLevel", value)}
        />
      </Field>
      <Field
        label='현재 경험치'
        help='입력하지 않으면 0으로 계산됩니다.'
        error={errors.presentExperience}
      >
        <NumberInput
          style={{ width: "100%" }}
          precision={0}
          placeholder='기본값 = 0'
          value={values.presentExperience}
          onChange={(value) => set("presentExperience", value)}
        />
      </Field>
      <Field
        label='목표 레벨'
        help='입력하지 않으면 다음 레벨로 설정됩니다.'
        error={errors.objectiveLevel}
      >
        <NumberInput
          style={{ width: "100%" }}
          precision={0}
          placeholder={`기본값 = ${
            values.presentLevel !== null
              ? values.presentLevel + 1
              : "현재 레벨 + 1"
          }`}
          value={values.objectiveLevel}
          onChange={(value) => set("objectiveLevel", value)}
        />
      </Field>
      <Field
        label='생산 경험치 버프 비율(%)'
        help='예) 20%일 경우 20'
        error={errors.productionPercent}
      >
        <NumberInput
          style={{ width: "100%" }}
          placeholder={`기본값 = ${DEFAULT_PRODUCTION_PERCENT}`}
          value={values.productionPercent}
          onChange={(value) => set("productionPercent", value)}
        />
      </Field>
      <Button type='submit' variant='primary' loading={loading}>
        계산하기
      </Button>
    </form>
  );
}
