import { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import { styles } from "./Button.styles";
import { Spinner } from "./Spin";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "default";
  danger?: boolean;
  icon?: ReactNode;
  // 진행 중 표시. 포커스는 그대로 두고 클릭과 폼 제출만 막는다
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = "default",
  danger,
  icon,
  loading,
  type = "button",
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      // 제출 버튼이면 폼 제출(Enter로 누른 것 포함)도 함께 막는다
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      {...rest}
      type={type}
      css={[
        styles.button,
        styles[variant],
        danger && styles.danger,
        danger && variant === "primary" && styles.primaryDanger,
        children == null && styles.iconOnly,
      ]}
      className={className}
      aria-busy={loading || undefined}
      onClick={handleClick}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  );
}
