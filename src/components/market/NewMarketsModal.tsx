import { validateMarketName } from "@/domain/market";
import { useId, useState } from "react";
import { NewMarket } from "@/types/market";
import {
  Button,
  Field,
  FormErrors,
  Input,
  Modal,
  NumberInput,
  Stack,
  Text,
  useForm,
  useToast,
} from "@/ui";

interface NewMarketRow {
  // 처음 받은 이름(칸의 접근 이름과 쓰는 물품을 찾는 데 쓴다)
  original: string;
  name: string;
  price: number | null;
}

const CELL_FIELD_STYLE = { marginBottom: 0 };

interface NewMarketsModalProps {
  // 추가할 재료 이름(미리 채우고 고칠 수 있다)
  names: string[];
  // 재료 이름 → 그 재료를 쓰는 물품 이름
  usedBy?: Record<string, string[]>;
  // 이미 있는 시세 이름(겹치면 안 된다)
  existingNames: ReadonlySet<string>;
  // 실패하면 reject한다. 이때 입력값을 유지하도록 모달을 닫지 않는다.
  onSubmit: (markets: NewMarket[]) => Promise<void>;
  onClose: () => void;
}

// 시세에 없는 재료를 시세에 추가한다. 열 때마다 새로 마운트해서 사용한다
export function NewMarketsModal({
  names,
  usedBy,
  existingNames,
  onSubmit,
  onClose,
}: NewMarketsModalProps) {
  const toast = useToast();
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  const { values, errors, setValues, handleSubmit } = useForm<{
    rows: NewMarketRow[];
  }>(
    () => ({
      rows: names.map((name) => ({ original: name, name, price: null })),
    }),
    ({ rows }) => {
      const errors: FormErrors = {};
      rows.forEach((row, index) => {
        const otherNames = new Set([
          ...existingNames,
          ...rows.filter((_, i) => i !== index).map(({ name }) => name.trim()),
        ]);
        errors[`rows.${index}.name`] = validateMarketName(row.name, otherNames);
        errors[`rows.${index}.price`] =
          row.price == null ? "시세를 입력해주세요" : undefined;
      });
      return errors;
    }
  );

  const setRow = (index: number, patch: Partial<NewMarketRow>) =>
    setValues(({ rows }) => ({
      rows: rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));

  const submit = async (rows: NewMarketRow[]) => {
    setSubmitting(true);
    try {
      // 검증을 통과했으므로 빈 칸이 없다
      await onSubmit(
        rows.map(({ name, price }) => ({
          name: name.trim(),
          price: price as number,
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
      width={560}
      title='시세 추가'
      onClose={onClose}
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
            추가
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit(
          ({ rows }) => void submit(rows),
          () => toast.error("정보를 다시 확인해주세요")
        )}
      >
        <Stack vertical gap={16}>
          <Text tone='secondary'>
            저장하면 이 재료를 쓰는 물품의 결과도 새 시세로 계산됩니다.
          </Text>
          {values.rows.map((row, index) => (
            <Stack key={row.original} vertical gap={4}>
              <Stack align='flex-start'>
                <Field
                  label={`${row.original} 이름`}
                  hideLabel
                  required
                  error={errors[`rows.${index}.name`]}
                  style={CELL_FIELD_STYLE}
                >
                  <Input
                    value={row.name}
                    onChange={(name) => setRow(index, { name })}
                    placeholder='재료 이름'
                  />
                </Field>
                <Field
                  label={`${row.original} 시세`}
                  hideLabel
                  required
                  error={errors[`rows.${index}.price`]}
                  style={CELL_FIELD_STYLE}
                >
                  <NumberInput
                    value={row.price}
                    onChange={(price) => setRow(index, { price })}
                    suffix='골드'
                    style={{ width: 180 }}
                    min={0}
                    precision={0}
                    placeholder='시세'
                  />
                </Field>
              </Stack>
              {!!usedBy?.[row.original]?.length && (
                <Text tone='secondary'>
                  쓰는 물품: {usedBy[row.original].join(", ")}
                </Text>
              )}
            </Stack>
          ))}
        </Stack>
      </form>
    </Modal>
  );
}
