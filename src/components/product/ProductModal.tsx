import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "@/domain/labels";
import { MAX_MATERIAL_SLOTS } from "@/domain/productExcel";
import { useId, useState } from "react";
import { Category, Tool } from "@/types/enums";
import { Product, ProductCreateRequest } from "@/types/product";
import {
  Button,
  Field,
  FormErrors,
  Input,
  Modal,
  NumberInput,
  Segmented,
  Select,
  Stack,
  Text,
  useForm,
  useToast,
} from "@/ui";

interface MaterialValues {
  // 줄의 React key(제출할 때 뺀다)
  key: number;
  name?: string;
  basic?: boolean;
  count?: number | null;
}

interface ProductValues {
  id?: number;
  name?: string;
  level?: number | null;
  craftingPrice?: number | null;
  tool?: Tool;
  category?: Category;
  materials: MaterialValues[];
}

const BASIC_OPTIONS = [
  { value: false, label: "하위재료 O" },
  { value: true, label: "최하위재료" },
];

// 비었거나 공백뿐이면 안 된다. 서버는 물품명·재료명에 쉼표를 허용하지 않는다(결과의 재료 목록을 쉼표로 저장).
const nameError = (name: string | undefined) =>
  !name?.trim()
    ? "물품명을 입력해주세요"
    : name.includes(",")
      ? "이름에 쉼표(,)는 쓸 수 없습니다"
      : undefined;

function validate(values: ProductValues): FormErrors {
  const errors: FormErrors = {
    name: nameError(values.name),
    level: values.level == null ? "레벨을 입력해주세요" : undefined,
    craftingPrice:
      values.craftingPrice == null ? "크래프팅 가격을 입력해주세요" : undefined,
    tool: values.tool ? undefined : "도구를 선택해주세요",
    category: values.category ? undefined : "카테고리를 선택해주세요",
  };
  values.materials.forEach(({ name, basic, count }, index) => {
    errors[`materials.${index}.name`] = nameError(name);
    errors[`materials.${index}.basic`] =
      basic == null ? "하위재료 여부를 선택해주세요" : undefined;
    errors[`materials.${index}.count`] =
      count == null
        ? "개수를 입력해주세요"
        : count > 0
          ? undefined
          : "개수는 0보다 커야 합니다";
  });
  return errors;
}

// 재료 한 줄의 칸은 아래 여백 없이 붙여 놓는다(줄 사이는 Stack 간격)
const ROW_FIELD_STYLE = { marginBottom: 0 };

interface ProductModalProps {
  // 수정할 물품. 없으면 추가 모드
  product?: Product;
  // 실패하면 reject한다. 이때 입력값을 유지하도록 모달을 닫지 않는다.
  onSubmit: (value: Product | ProductCreateRequest) => Promise<void>;
  onClose: () => void;
}

// 열 때마다 새로 마운트해서 사용한다(초기값은 마운트 시점에 한 번 적용)
export function ProductModal({
  product,
  onSubmit,
  onClose,
}: ProductModalProps) {
  const toast = useToast();
  const formId = useId();
  const { values, errors, set, setValues, handleSubmit } =
    useForm<ProductValues>(
      () =>
        product
          ? {
              ...product,
              materials: product.materials.map((material, key) => ({
                ...material,
                key,
              })),
            }
          : { materials: [{ key: 0, basic: true }] },
      validate
    );
  const [submitting, setSubmitting] = useState(false);
  const { materials } = values;

  const setMaterials = (
    update: (materials: MaterialValues[]) => MaterialValues[]
  ) => setValues((prev) => ({ ...prev, materials: update(prev.materials) }));

  const setMaterial = (index: number, patch: Partial<MaterialValues>) =>
    setMaterials((prev) =>
      prev.map((material, i) =>
        i === index ? { ...material, ...patch } : material
      )
    );

  const submit = async ({ materials, ...value }: ProductValues) => {
    setSubmitting(true);
    try {
      // 검증을 통과했으므로 빈 칸이 없다
      await onSubmit({
        ...value,
        materials: materials.map(({ key, ...material }) => material),
      } as Product | ProductCreateRequest);
      onClose();
    } catch {
      // 실패 메시지는 호출부에서 보여 준다
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      width={700}
      title={product ? `${product.name} 정보 수정` : "물품 추가"}
      onClose={onClose}
      // 저장 중에는 닫지 못하게 해서, 실패 시 입력을 유지하고 늦게 온 응답이 다른 모달을 닫지 않게 한다
      dismissible={!submitting}
      footer={
        <>
          <Button disabled={submitting} onClick={onClose}>
            취소
          </Button>
          <Button
            type='submit'
            form={formId}
            variant='primary'
            loading={submitting}
          >
            {product ? "수정" : "추가"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        style={{ margin: "30px 0" }}
        onSubmit={handleSubmit(
          (value) => void submit(value),
          () => toast.error("정보를 다시 확인해주세요")
        )}
      >
        {/* 칸 이름은 접근 이름으로만 쓰고(hideLabel) 화면에는 placeholder만 보인다 */}
        <Field label='물품명' hideLabel required error={errors.name}>
          <Input
            value={values.name ?? ""}
            onChange={(name) => set("name", name)}
            placeholder='물품명'
            // 열리면 바로 입력할 수 있게 첫 입력에 포커스를 둔다
            // eslint-disable-next-line jsx-a11y-x/no-autofocus
            autoFocus
          />
        </Field>
        <Field label='레벨' hideLabel required error={errors.level}>
          <NumberInput
            value={values.level ?? null}
            onChange={(level) => set("level", level)}
            style={{ width: 120 }}
            min={0}
            max={200}
            placeholder='레벨'
          />
        </Field>
        <Field
          label='크래프팅 가격'
          hideLabel
          required
          error={errors.craftingPrice}
        >
          <NumberInput
            value={values.craftingPrice ?? null}
            onChange={(craftingPrice) => set("craftingPrice", craftingPrice)}
            suffix='골드'
            style={{ width: 180 }}
            min={0}
            placeholder='크래프팅 가격'
          />
        </Field>
        <Field label='도구' hideLabel required error={errors.tool}>
          <Select
            value={values.tool}
            onChange={(tool) => set("tool", tool)}
            options={TOOL_OPTIONS}
            placeholder='도구'
          />
        </Field>
        <Field label='카테고리' hideLabel required error={errors.category}>
          <Select
            value={values.category}
            onChange={(category) => set("category", category)}
            options={CATEGORY_OPTIONS}
            placeholder='카테고리'
          />
        </Field>
        <Stack vertical>
          <Text>필요 재료 (최대 {MAX_MATERIAL_SLOTS}개)</Text>
          {materials.map((material, index) => (
            <Stack key={material.key}>
              <Field
                label='물품명'
                hideLabel
                required
                style={ROW_FIELD_STYLE}
                error={errors[`materials.${index}.name`]}
              >
                <Input
                  value={material.name ?? ""}
                  onChange={(name) => setMaterial(index, { name })}
                  placeholder='물품명'
                />
              </Field>
              <Field
                label='하위재료 여부'
                hideLabel
                required
                style={ROW_FIELD_STYLE}
                error={errors[`materials.${index}.basic`]}
              >
                <Segmented
                  value={material.basic}
                  onChange={(basic) => setMaterial(index, { basic })}
                  options={BASIC_OPTIONS}
                />
              </Field>
              <Field
                label='개수'
                hideLabel
                required
                style={ROW_FIELD_STYLE}
                error={errors[`materials.${index}.count`]}
              >
                <NumberInput
                  value={material.count ?? null}
                  onChange={(count) => setMaterial(index, { count })}
                  suffix='개'
                  min={0}
                  max={100}
                  placeholder='개수'
                />
              </Field>
              {index > 0 && (
                <Button
                  onClick={() =>
                    setMaterials((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  -
                </Button>
              )}
              {index === materials.length - 1 &&
                materials.length < MAX_MATERIAL_SLOTS && (
                  <Button
                    onClick={() =>
                      setMaterials((prev) => [
                        ...prev,
                        {
                          key: Math.max(...prev.map(({ key }) => key)) + 1,
                          basic: true,
                        },
                      ])
                    }
                  >
                    +
                  </Button>
                )}
            </Stack>
          ))}
        </Stack>
      </form>
    </Modal>
  );
}
