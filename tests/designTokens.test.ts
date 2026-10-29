import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  componentTokens,
  designTokens,
  primitiveTokens,
  semanticTokens,
} from "@/ui/tokens";

const tokens: Readonly<Record<string, string>> = designTokens;

function references(value: string): string[] {
  return Array.from(
    value.matchAll(/var\(\s*(--ui-[\w-]+)/g),
    ([, name]) => name
  );
}

function resolveToken(name: string, path: string[] = []): string {
  if (path.includes(name)) {
    throw new Error(`토큰 순환 참조: ${[...path, name].join(" → ")}`);
  }
  const value = tokens[name];
  if (value === undefined) throw new Error(`선언되지 않은 토큰: ${name}`);
  return value.replace(/var\(\s*(--ui-[\w-]+)\s*\)/g, (_, reference: string) =>
    resolveToken(reference, [...path, name])
  );
}

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

function luminance(hex: string): number {
  if (!/^#[\da-f]{6}$/i.test(hex)) {
    throw new Error(`대비 계산에는 6자리 HEX 색상이 필요합니다: ${hex}`);
  }
  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground: string, background: string): number {
  const first = luminance(resolveToken(foreground));
  const second = luminance(resolveToken(background));
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

const surfaces = [
  "--ui-color-bg-container",
  "--ui-color-bg-layout",
  "--ui-color-fill-alter",
  "--ui-color-primary-bg",
  "--ui-color-bg-hover",
];

const textContrastPairs = [
  ...["--ui-color-text", "--ui-color-text-secondary"].flatMap((foreground) =>
    surfaces.map((background) => [foreground, background])
  ),
  ["--ui-color-text-placeholder", "--ui-color-bg-container"],
  ...[
    ["--ui-color-primary", "--ui-color-primary-bg"],
    ["--ui-color-primary-hover", "--ui-color-primary-bg"],
    ["--ui-color-primary-active", "--ui-color-primary-bg"],
    ["--ui-color-success", "--ui-color-success-bg"],
    ["--ui-color-warning", "--ui-color-warning-bg"],
    ["--ui-color-danger", "--ui-color-error-bg"],
    ["--ui-color-info", "--ui-color-info-bg"],
  ].flatMap(([foreground, background]) => [
    [foreground, background],
    [foreground, "--ui-color-bg-container"],
  ]),
  ...[
    "--ui-color-primary",
    "--ui-color-primary-hover",
    "--ui-color-primary-active",
    "--ui-color-danger",
    "--ui-color-danger-hover",
  ].map((background) => ["--ui-color-text-inverse", background]),
];

describe("디자인 토큰", () => {
  test("계층 사이에 같은 이름을 중복 선언하지 않는다", () => {
    const names = [
      ...Object.keys(primitiveTokens),
      ...Object.keys(semanticTokens),
      ...Object.keys(componentTokens),
    ];
    expect(new Set(names).size).toBe(names.length);
  });

  test("토큰의 참조가 모두 선언되어 있고 순환하지 않는다", () => {
    for (const [name, value] of Object.entries(tokens)) {
      for (const reference of references(value)) {
        expect(tokens, `${name} → ${reference}`).toHaveProperty(reference);
      }
      expect(() => resolveToken(name)).not.toThrow();
    }
  });

  test("화면과 공용 컴포넌트가 선언된 디자인 토큰만 참조한다", () => {
    const files = sourceFiles(resolve("src"));
    for (const file of files) {
      for (const name of references(readFileSync(file, "utf8"))) {
        expect(tokens, `${file} → ${name}`).toHaveProperty(name);
      }
    }
  });

  test.each(textContrastPairs)(
    "%s 글자와 %s 배경은 일반 글자 대비 4.5:1을 충족한다",
    (foreground, background) => {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  );
});
