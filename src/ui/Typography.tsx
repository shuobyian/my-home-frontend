import { HTMLAttributes } from "react";
import { styles } from "./Typography.styles";

type Tone = "secondary" | "success" | "warning" | "danger" | "info";

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5;
}

export function Title({ level = 1, className, ...rest }: TitleProps) {
  const Heading = `h${level}` as const;
  return (
    <Heading
      {...rest}
      css={[styles.title, styles[Heading]]}
      className={className}
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
      css={[strong && styles.strong, tone && styles[tone]]}
      className={className}
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
      css={[styles.paragraph, tone && styles[tone]]}
      className={className}
    />
  );
}
