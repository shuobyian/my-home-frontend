import { Panel } from "@/components/common/Panel";
import { CHANGE_TARGET_OPTIONS } from "@/domain/labels";
import {
  CHANGE_FIELDS,
  ChangeCandidate,
  ChangeDraft,
  createChangeDraft,
  findChangeField,
  formatChangeValue,
} from "@/domain/report";
import { ChangeTarget } from "@/types/enums";
import {
  Button,
  DeleteIcon,
  Field,
  FieldRow,
  Input,
  PlusIcon,
  Select,
  Stack,
  Text,
} from "@/ui";

interface ChangeEditorProps {
  drafts: readonly ChangeDraft[];
  candidates: Record<ChangeTarget, ChangeCandidate[]>;
  // 줄마다의 오류 안내
  errors: readonly (string | undefined)[];
  max: number;
  onChange: (drafts: ChangeDraft[]) => void;
}

// 제보의 바꿀 값 목록: 줄마다 종류 → 대상 → 항목을 고르고 바른 값을 적는다
export function ChangeEditor({
  drafts,
  candidates,
  errors,
  max,
  onChange,
}: ChangeEditorProps) {
  const update = (index: number, patch: Partial<ChangeDraft>) =>
    onChange(
      drafts.map((draft, i) => (i === index ? { ...draft, ...patch } : draft))
    );

  return (
    <Stack vertical>
      {drafts.map((draft, index) => (
        <ChangeRow
          key={draft.key}
          index={index}
          draft={draft}
          candidates={candidates[draft.target]}
          error={errors[index]}
          onChange={(patch) => update(index, patch)}
          onRemove={() => onChange(drafts.filter((_, i) => i !== index))}
        />
      ))}
      <Stack>
        <Button
          icon={<PlusIcon />}
          disabled={drafts.length >= max}
          onClick={() =>
            onChange([
              ...drafts,
              createChangeDraft(
                Math.max(0, ...drafts.map(({ key }) => key)) + 1
              ),
            ])
          }
        >
          바꿀 값 추가
        </Button>
        <Text tone='secondary'>
          {drafts.length}/{max}
        </Text>
      </Stack>
    </Stack>
  );
}

interface ChangeRowProps {
  index: number;
  draft: ChangeDraft;
  candidates: readonly ChangeCandidate[];
  error?: string;
  onChange: (patch: Partial<ChangeDraft>) => void;
  onRemove: () => void;
}

function ChangeRow({
  index,
  draft,
  candidates,
  error,
  onChange,
  onRemove,
}: ChangeRowProps) {
  const name = `바꿀 값 ${index + 1}`;
  const current = candidates.find(({ id }) => id === draft.targetId);
  const field = findChangeField(draft.target, draft.field);

  return (
    <Panel style={{ padding: "var(--ui-space-4)" }}>
      <Stack justify='space-between'>
        <Text strong>{name}</Text>
        <Button
          icon={<DeleteIcon />}
          aria-label={`${name} 지우기`}
          onClick={onRemove}
        />
      </Stack>
      <FieldRow>
        <Field label='종류'>
          <Select
            value={draft.target}
            options={CHANGE_TARGET_OPTIONS}
            // 종류가 바뀌면 대상·항목·값도 처음부터 고른다
            onChange={(target) =>
              onChange(createChangeDraft(draft.key, target))
            }
          />
        </Field>
        <Field label='대상' required>
          <Select
            value={
              draft.targetId === undefined ? undefined : String(draft.targetId)
            }
            placeholder='골라주세요'
            options={candidates.map(({ id, label }) => ({
              value: String(id),
              label,
            }))}
            onChange={(id) => onChange({ targetId: Number(id) })}
          />
        </Field>
        <Field label='항목'>
          <Select
            value={draft.field}
            options={CHANGE_FIELDS[draft.target].map(({ field, label }) => ({
              value: field,
              label,
            }))}
            onChange={(next) => onChange({ field: next, value: "" })}
          />
        </Field>
        <Field
          label='바른 값'
          required
          error={error}
          help={
            current &&
            `현재 값: ${formatChangeValue(draft.target, draft.field, current.values[draft.field])}`
          }
        >
          {field?.kind.type === "enum" ? (
            <Select
              value={draft.value || undefined}
              placeholder='골라주세요'
              options={field.kind.options}
              onChange={(value) => onChange({ value })}
            />
          ) : (
            <Input
              value={draft.value}
              inputMode={field?.kind.type === "text" ? undefined : "decimal"}
              onChange={(value) => onChange({ value })}
            />
          )}
        </Field>
      </FieldRow>
    </Panel>
  );
}
