import { MARKET_GROUP_OPTIONS } from "@/domain/labels";
import { validateMarketName } from "@/domain/market";
import { useId, useState } from "react";
import { MarketGroup, MarketGroupType } from "@/types/enums";
import { MarketUpdateItem } from "@/types/market";
import {
  Button,
  Field,
  FieldRow,
  Form,
  Input,
  Modal,
  NumberInput,
  Select,
  useForm,
  useToast,
} from "@/ui";

interface AddMarketModalProps {
  // 이미 있는 시세 이름(겹치면 안 된다)
  existingNames: ReadonlySet<string>;
  // 새 시세 하나(PUT /market 항목). 실패하면 reject한다. 이때 입력값을 유지하도록 모달을 닫지 않는다.
  onSubmit: (market: MarketUpdateItem) => Promise<void>;
  onClose: () => void;
}

// 시세 편집 화면의 '재료 추가': 이름·시세·분류를 받아 새 시세 하나를 추가한다. 열 때마다 새로 마운트해서 사용한다
export function AddMarketModal({
  existingNames,
  onSubmit,
  onClose,
}: AddMarketModalProps) {
  const toast = useToast();
  const formId = useId();
  const [submitting, setSubmitting] = useState(false);
  const { values, errors, set, handleSubmit } = useForm<{
    name: string;
    price: number | null;
    group: MarketGroup;
  }>({ name: "", price: null, group: MarketGroupType.ETC }, (values) => ({
    name: validateMarketName(values.name, existingNames),
    price: values.price == null ? "시세를 입력해주세요" : undefined,
  }));

  const submit = async ({ name, price, group }: typeof values) => {
    setSubmitting(true);
    try {
      // 검증을 통과했으므로 시세가 있다
      await onSubmit({ name: name.trim(), price: price as number, group });
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
      width={480}
      title='재료 추가'
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
      <Form
        id={formId}
        onSubmit={handleSubmit(
          (values) => void submit(values),
          () => toast.error("정보를 다시 확인해주세요")
        )}
      >
        <Field label='이름' required error={errors.name}>
          <Input
            value={values.name}
            onChange={(name) => set("name", name)}
            // 열리면 바로 입력할 수 있게 첫 입력에 포커스를 둔다
            // eslint-disable-next-line jsx-a11y-x/no-autofocus
            autoFocus
          />
        </Field>
        <FieldRow>
          <Field label='시세' required error={errors.price}>
            <NumberInput
              value={values.price}
              onChange={(price) => set("price", price)}
              suffix='골드'
              min={0}
              precision={0}
            />
          </Field>
          <Field label='분류'>
            <Select
              value={values.group}
              onChange={(group) => set("group", group)}
              options={MARKET_GROUP_OPTIONS}
            />
          </Field>
        </FieldRow>
      </Form>
    </Modal>
  );
}
