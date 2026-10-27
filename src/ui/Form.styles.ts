import { css } from "@emotion/react";

export const styles = {
  // Field: 라벨은 위, 컨트롤은 아래
  field: css`
    margin-bottom: var(--ui-space-5);
  `,

  label: css`
    padding-bottom: var(--ui-space-2);
  `,

  required: css`
    margin-right: var(--ui-space-1);
    color: var(--ui-color-danger);
  `,

  error: css`
    color: var(--ui-color-danger);
  `,

  help: css`
    color: var(--ui-color-text-secondary);
  `,

  // Input·NumberInput의 테두리 상자. invalid·disabled·numberControl·hasSuffixControl은 이 뒤에 둔다
  control: css`
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--ui-control-height);
    padding: 0 11px;
    color: var(--ui-color-text);
    background: var(--ui-color-bg-container);
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius);
    transition:
      border-color var(--ui-motion),
      box-shadow var(--ui-motion);

    &:hover {
      border-color: var(--ui-color-primary-hover);
    }

    &:focus-within {
      border-color: var(--ui-color-primary);
      box-shadow: var(--ui-focus-ring);
    }
  `,

  // 포커스는 테두리 상자가 보여 준다
  input: css`
    flex: 1;
    width: 100%;
    min-width: 0;
    height: 100%;
    padding: 0;
    background: transparent;
    border: 0;

    &:focus {
      outline: 0;
    }

    &::placeholder {
      color: var(--ui-color-text-secondary);
      opacity: 1;
    }

    &:disabled {
      cursor: not-allowed;
    }
  `,

  center: css`
    text-align: center;
  `,

  end: css`
    text-align: end;
  `,

  // TextArea: 테두리·포커스는 control과 같고 높이는 줄 수(rows)를 따른다. control 뒤에 둔다
  textArea: css`
    display: block;
    height: auto;
    padding: 4px 11px;
    resize: vertical;

    &:focus {
      outline: 0;
    }

    &::placeholder {
      color: var(--ui-color-text-secondary);
      opacity: 1;
    }
  `,

  // 입력창 오른쪽 끝 로딩 표시
  spinner: css`
    margin-left: var(--ui-space-1);
    color: var(--ui-color-text-secondary);
  `,

  // 지우기·비밀번호 보기 버튼
  affix: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: var(--ui-space-1);
    color: var(--ui-color-text-secondary);
    cursor: pointer;
    background: none;
    border: 0;

    &:hover {
      color: var(--ui-color-text);
    }

    &:disabled {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
    }
  `,

  invalid: css`
    &,
    &:hover,
    &:focus-within {
      border-color: var(--ui-color-danger);
    }
  `,

  // invalid 뒤에 둔다
  disabled: css`
    &,
    &:hover {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
      background: var(--ui-color-bg-disabled);
      border-color: var(--ui-color-border);
    }
  `,

  // NumberInput: 기본 폭 90px + 단위
  number: css`
    display: inline-flex;
    max-width: 100%;
    vertical-align: top;
  `,

  // NumberInput 안의 테두리 상자
  numberControl: css`
    flex: 1 1 auto;
    width: 90px;
    min-width: 0;
  `,

  // 단위가 붙을 때 테두리 상자의 오른쪽 모서리
  hasSuffixControl: css`
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  `,

  addon: css`
    display: flex;
    flex: none;
    align-items: center;
    padding: 0 11px;
    white-space: nowrap;
    background: var(--ui-color-fill-alter);
    border: 1px solid var(--ui-color-border);
    border-left: 0;
    border-radius: 0 var(--ui-radius) var(--ui-radius) 0;
  `,

  // Select: 높이·테두리·포커스는 테두리 상자와 같다. 펼친 목록의 항목(option)은 안내 글자색을 물려받지 않는다
  select: css`
    display: block;
    width: 100%;
    height: var(--ui-control-height);
    padding: 0 30px 0 11px;
    color: var(--ui-color-text);
    cursor: pointer;
    background: var(--ui-color-bg-container)
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-opacity='.45' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")
      no-repeat right 11px center / 12px 12px;
    border: 1px solid var(--ui-color-border);
    border-radius: var(--ui-radius);
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    transition:
      border-color var(--ui-motion),
      box-shadow var(--ui-motion);

    &:hover:not(:disabled) {
      border-color: var(--ui-color-primary-hover);
    }

    &:focus {
      border-color: var(--ui-color-primary);
      outline: 0;
      box-shadow: var(--ui-focus-ring);
    }

    &[aria-invalid="true"],
    &[aria-invalid="true"]:hover {
      border-color: var(--ui-color-danger);
    }

    &:disabled {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
      background-color: var(--ui-color-bg-disabled);
    }

    & option {
      color: var(--ui-color-text);
    }
  `,

  // select 뒤에 둔다
  placeholder: css`
    color: var(--ui-color-text-secondary);
  `,

  // Segmented: 회색 바탕에 고른 칸만 흰색
  segmented: css`
    display: inline-flex;
    max-width: 100%;
    padding: 2px;
    vertical-align: top;
    background: var(--ui-color-bg-layout);
    border-radius: var(--ui-radius);
  `,

  // invalid와 함께 붙는다
  segmentedInvalid: css`
    box-shadow: inset 0 0 0 1px var(--ui-color-danger);
  `,

  // selected·segmentDisabled는 이 뒤에 둔다.
  // 숨긴 라디오의 포커스를 바로 뒤 글자 칸(segmentLabel)에 그린다. 마우스로 고를 때는 그리지 않는다
  // (:focus-visible을 모르는 브라우저는 둘째 규칙을 버려 늘 그린다)
  segment: css`
    position: relative;
    display: flex;
    color: var(--ui-color-text-secondary);
    white-space: nowrap;
    cursor: pointer;
    border-radius: var(--ui-radius-sm);
    transition:
      color var(--ui-motion),
      background-color var(--ui-motion);

    &:hover {
      color: var(--ui-color-text);
    }

    & > input:focus + span {
      outline: 2px solid var(--ui-color-primary);
      outline-offset: 1px;
    }

    & > input:focus:not(:focus-visible) + span {
      outline: none;
    }
  `,

  segmentLabel: css`
    display: flex;
    align-items: center;
    min-height: 28px;
    padding: 0 11px;
    border-radius: inherit;
  `,

  selected: css`
    color: var(--ui-color-text);
    background: var(--ui-color-bg-container);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px rgba(0, 0, 0, 0.02);
  `,

  segmentDisabled: css`
    &,
    &:hover {
      color: var(--ui-color-text-disabled);
      cursor: not-allowed;
    }
  `,
};
