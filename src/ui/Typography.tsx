import { HTMLAttributes } from "react";
import { cx } from "./cx";
import styles from "./Typography.module.css";

type Tone = "secondary" | "success" | "warning" | "danger" | "info";

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5;
}

export function Title({ level = 1, className, ...rest }: TitleProps) {
  const Heading = `h${level}` as const;
  return (
    <Heading
      {...rest}
      className={cx(styles.title, styles[Heading], className)}
    />
  );
}

interface TextProps extends HTMLAttributes<HTMLSpanElement> {
  strong?: boolean;
  tone?: Tone;
}

export function Text({ strong, tone, className, ...rest }: TextProps) {
  return (
    <span
      {...rest}
      className={cx(strong && styles.strong, tone && styles[tone], className)}
    />
  );
}

interface ParagraphProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: Tone;
}

export function Paragraph({ tone, className, ...rest }: ParagraphProps) {
  return (
    <p
      {...rest}
      className={cx(styles.paragraph, tone && styles[tone], className)}
    />
  );
}
