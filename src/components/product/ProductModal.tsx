import {
  CatalogNames,
  classifyMaterial,
  inferBasic,
  isBlockingRef,
  MATERIAL_REF_TEXT,
  MaterialRef,
} from "@/domain/catalog";
import { CATEGORY_OPTIONS, TOOL_OPTIONS } from "@/domain/labels";
import { MAX_MATERIAL_SLOTS } from "@/domain/productExcel";
import { styles } from "@/components/product/ProductModal.styles";
import { Fragment, useId, useState } from "react";
import { Category, Tool } from "@/types/enums";
import { NewMarket } from "@/types/market";
import { Product, ProductCreateRequest } from "@/types/product";
import {
  Button,
  Field,
  FieldRow,
  Form,
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
  // 하위재료 여부를 직접 골랐는지(제출할 때 뺀다). 고르지 않았으면 이름으로 정해 준다
  basicTouched?: boolean;
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
  // 시세에 없는 새 재료의 시세(재료 이름 → 시세). 지금 레시피에 남은 이름만 제출한다
  newMarketPrices: Record<string, number | null>;
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

// 시세·물품 이름과 비교한 재료 줄마다의 참조. 분류할 수 없으면(이름이 없으면) undefined
function classifyRows(values: ProductValues, names?: CatalogNames) {
  return values.materials.map((material) =>
    names ? classifyMaterial(material, names, values.name) : undefined
  );
}

// 시세에 없는 최하위재료 이름(레시피 순, 중복 없음)
function missingMarketNames(
  values: ProductValues,
  refs: (MaterialRef | undefined)[]
) {
  const names = values.materials
    .filter((_, index) => refs[index] === "missing-market")
    .map(({ name }) => (name ?? "").trim());
  return [...new Set(names)];
}

function validate(
  values: ProductValues,
  refs: (MaterialRef | undefined)[],
  requireNewMarketPrices: boolean
): FormErrors {
  const errors: FormErrors = {
    name: nameError(values.name),
    level: values.level == null ? "레벨을 입력해주세요" : undefined,
    craftingPrice:
      values.craftingPrice == null ? "크래프팅 가격을 입력해주세요" : undefined,
    tool: values.tool ? undefined : "도구를 선택해주세요",
    category: values.category ? undefined : "카테고리를 선택해주세요",
  };
  values.materials.forEach(({ name, basic, count }, index) => {
    const ref = refs[index];
    errors[`materials.${index}.name`] =
      nameError(name) ??
      (requireNewMarketPrices && isBlockingRef(ref)
        ? MATERIAL_REF_TEXT[ref]
        : undefined);
    errors[`materials.${index}.basic`] =
      basic == null ? "하위재료 여부를 선택해주세요" : undefined;
    errors[`materials.${index}.count`] =
      count == null
        ? "개수를 입력해주세요"
        : count > 0
          ? undefined
          : "개수는 0보다 커야 합니다";
  });
  if (requireNewMarketPrices) {
    missingMarketNames(values, refs).forEach((name) => {
      errors[`newMarkets.${name}`] =
        values.newMarketPrices[name] == null
          ? "시세를 입력해주세요"
          : undefined;
    });
  }
  return errors;
}

interface ProductModalProps {
  // 수정할 물품. 없으면 추가 모드
  product?: Product;
  // 재료 이름을 맞춰 볼 시세·물품 이름. 있으면 이름 후보와 재료 줄마다의 참조 상태를 보여 준다
  catalogNames?: CatalogNames;
  // true면 서버가 거절할 참조는 제출을 막고, 시세에 없는 새 재료는 시세를 함께 받는다(서버 물품 관리).
  // false면 참조 상태를 경고로만 보여 준다(Raw 편집)
  requireNewMarketPrices?: boolean;
  // newMarkets: 물품보다 먼저 시세에 추가할 새 재료(requireNewMarketPrices가 아니면 []).
  // 실패하면 reject한다. 이때 입력값을 유지하도록 모달을 닫지 않는다.
  onSubmit: (
    value: Product | ProductCreateRequest,
    newMarkets: NewMarket[]
  ) => Promise<void>;
  onClose: () => void;
}

// 열 때마다 새로 마운트해서 사용한다(초기값은 마운트 시점에 한 번 적용)
export function ProductModal({
  product,
  catalogNames,
  requireNewMarketPrices = false,
  onSubmit,
  onClose,
}: ProductModalProps) {
  const toast = useToast();
  const formId = useId();
  const datalistId = useId();
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
              newMarketPrices: {},
            }
          : // 새 줄은 하위재료 여부를 고르지 않은 채로 둔다(이름으로 정하거나 직접 고르게 한다)
            { materials: [{ key: 0 }], newMarketPrices: {} },
      (values) =>
        validate(
          values,
          classifyRows(values, catalogNames),
          requireNewMarketPrices
        )
    );
  const [submitting, setSubmitting] = useState(false);
  const { materials } = values;
  const refs = classifyRows(values, catalogNames);
  const newMarketNames = requireNewMarketPrices
    ? missingMarketNames(values, refs)
    : [];

  const setMaterials = (
    update: (materials: MaterialValues[]) => MaterialValues[]
  ) => setValues((prev) => ({ ...prev, materials: update(prev.materials) }));

  const setMaterial = (index: number, patch: Partial<MaterialValues>) =>
    setMaterials((prev) =>
      prev.map((material, i) =>
        i === index ? { ...material, ...patch } : material
      )
    );

  // 이름을 입력하면, 하위재료 여부를 직접 고르지 않은 줄은 이름으로 정할 수 있을 때 정해 준다
  const setMaterialName = (index: number, name: string) =>
    setMaterials((prev) =>
      prev.map((material, i) => {
        if (i !== index) return material;
        const inferred =
          catalogNames && !material.basicTouched
            ? inferBasic(name, catalogNames)
            : undefined;
        return {
          ...material,
          name,
          ...(inferred !== undefined && { basic: inferred }),
        };
      })
    );

  const setNewMarketPrice = (name: string, price: number | null) =>
    setValues((prev) => ({
      ...prev,
      newMarketPrices: { ...prev.newMarketPrices, [name]: price },
    }));

  const submit = async ({
    materials,
    newMarketPrices,
    ...value
  }: ProductValues) => {
    setSubmitting(true);
    try {
      // 검증을 통과했으므로 빈 칸이 없다
      await onSubmit(
        {
          ...value,
          materials: materials.map(
            ({ key, basicTouched, ...material }) => material
          ),
        } as Product | ProductCreateRequest,
        newMarketNames.map((name) => ({
          name,
          price: newMarketPrices[name] as number,
        }))
      );
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
      <Form
        id={formId}
        style={{ margin: "var(--ui-space-4) 0" }}
        onSubmit={handleSubmit(
          (value) => void submit(value),
          () => toast.error("정보를 다시 확인해주세요")
        )}
      >
        <Field label='물품명' required error={errors.name}>
          <Input
            value={values.name ?? ""}
            onChange={(name) => set("name", name)}
            // 열리면 바로 입력할 수 있게 첫 입력에 포커스를 둔다
            // eslint-disable-next-line jsx-a11y-x/no-autofocus
            autoFocus
          />
        </Field>
        <FieldRow>
          <Field label='레벨' required error={errors.level}>
            <NumberInput
              value={values.level ?? null}
              onChange={(level) => set("level", level)}
              min={0}
              max={200}
            />
          </Field>
          <Field label='크래프팅 가격' required error={errors.craftingPrice}>
            <NumberInput
              value={values.craftingPrice ?? null}
              onChange={(craftingPrice) => set("craftingPrice", craftingPrice)}
              suffix='골드'
              min={0}
            />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label='도구' required error={errors.tool}>
            <Select
              value={values.tool}
              onChange={(tool) => set("tool", tool)}
              options={TOOL_OPTIONS}
              placeholder='선택'
            />
          </Field>
          <Field label='카테고리' required error={errors.category}>
            <Select
              value={values.category}
              onChange={(category) => set("category", category)}
              options={CATEGORY_OPTIONS}
              placeholder='선택'
            />
          </Field>
        </FieldRow>
        <div>
          <div css={styles.sectionLabel}>
            필요 재료 (최대 {MAX_MATERIAL_SLOTS}개)
          </div>
          {/* 열 제목은 화면용이고, 칸마다의 접근 이름은 숨긴 라벨(hideLabel)이 맡는다 */}
          <div css={styles.materials}>
            <div css={styles.columnTitle} aria-hidden='true'>
              물품명
            </div>
            <div css={styles.columnTitle} aria-hidden='true'>
              하위재료 여부
            </div>
            <div css={styles.columnTitle} aria-hidden='true'>
              개수
            </div>
            <div />
            {materials.map((material, index) => {
              const ref = refs[index];
              const nameFieldError = errors[`materials.${index}.name`];
              return (
                <Fragment key={material.key}>
                  <Field
                    label='물품명'
                    hideLabel
                    required
                    error={nameFieldError}
                  >
                    <Input
                      value={material.name ?? ""}
                      onChange={(name) => setMaterialName(index, name)}
                      list={catalogNames ? datalistId : undefined}
                      autoComplete={catalogNames ? "off" : undefined}
                    />
                  </Field>
                  <Field
                    label='하위재료 여부'
                    hideLabel
                    required
                    error={errors[`materials.${index}.basic`]}
                  >
                    <Segmented
                      value={material.basic}
                      onChange={(basic) =>
                        setMaterial(index, { basic, basicTouched: true })
                      }
                      options={BASIC_OPTIONS}
                    />
                  </Field>
                  <Field
                    label='개수'
                    hideLabel
                    required
                    error={errors[`materials.${index}.count`]}
                  >
                    <NumberInput
                      value={material.count ?? null}
                      onChange={(count) => setMaterial(index, { count })}
                      suffix='개'
                      min={0}
                      max={100}
                    />
                  </Field>
                  <div css={styles.actions}>
                    {index > 0 && (
                      <Button
                        onClick={() =>
                          setMaterials((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
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
                                key:
                                  Math.max(...prev.map(({ key }) => key)) + 1,
                              },
                            ])
                          }
                        >
                          +
                        </Button>
                      )}
                  </div>
                  {/* 제출을 막는 참조는 이름 칸 오류로 보여 주므로 그때는 한 번만 보인다 */}
                  {ref && ref !== "ok" && !nameFieldError && (
                    <div css={styles.fullRow}>
                      <Text
                        tone={
                          requireNewMarketPrices && isBlockingRef(ref)
                            ? "danger"
                            : "warning"
                        }
                      >
                        {MATERIAL_REF_TEXT[ref]}
                      </Text>
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
        {newMarketNames.length > 0 && (
          <Stack vertical gap='var(--ui-space-1)'>
            <Text strong>시세에 없는 새 재료</Text>
            <Text tone='secondary'>
              오타가 아니라 새 재료라면 시세를 입력하세요. 저장할 때 시세에 함께
              추가됩니다.
            </Text>
            {newMarketNames.map((name) => (
              <Field
                key={name}
                label={`새 시세: ${name}`}
                required
                error={errors[`newMarkets.${name}`]}
              >
                <NumberInput
                  value={values.newMarketPrices[name] ?? null}
                  onChange={(price) => setNewMarketPrice(name, price)}
                  suffix='골드'
                  style={{ width: 180 }}
                  min={0}
                  precision={0}
                />
              </Field>
            ))}
          </Stack>
        )}
        {catalogNames && (
          <datalist id={datalistId}>
            {[...catalogNames.markets].map((name) => (
              <option key={`market:${name}`} value={name} label='시세' />
            ))}
            {[...catalogNames.products].map((name) => (
              <option key={`product:${name}`} value={name} label='물품' />
            ))}
          </datalist>
        )}
      </Form>
    </Modal>
  );
}
