import { FormHTMLAttributes, HTMLAttributes, Ref } from "react";
import { styles } from "./Form.styles";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  ref?: Ref<HTMLFormElement>;
}

// 입력 폼. 바로 아래 자식(Field·FieldRow·버튼 등)을 같은 간격으로 세로로 쌓는다
export function Form(props: FormProps) {
  return <form css={styles.form} {...props} />;
}

// Field 여러 개를 같은 폭으로 한 줄에 놓는다. 좁은 화면에서는 다음 줄로 넘어간다
export function FieldRow(props: HTMLAttributes<HTMLDivElement>) {
  return <div css={styles.fieldRow} {...props} />;
}
