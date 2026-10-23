// @ts-check
import eslintReact from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import confusingBrowserGlobals from "confusing-browser-globals";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, globalIgnores } from "eslint/config";
import fs from "node:fs";
import globals from "globals";
import tseslint from "typescript-eslint";

const TEST_FILES = ["src/**/*.test.{ts,tsx}", "src/test/**"];

// 레이어 경계(README의 폴더 구조 참고). 화면 → 서버 상태 → API 순으로만 의존한다.

// @eslint-react에도 있는 훅 규칙은 공식 react-hooks 플러그인으로만 검사한다(중복 보고 방지)
const HOOK_RULES_FROM_REACT_HOOKS = [
  "rules-of-hooks",
  "exhaustive-deps",
  "error-boundaries",
  "purity",
  "refs",
  "immutability",
  "globals",
  "set-state-in-effect",
  "set-state-in-render",
  "static-components",
  "use-memo",
  "unsupported-syntax",
];
// components의 도메인 폴더. 결과 표시(result)는 여러 화면이 함께 쓰는 공용 도메인이다.
// 새 도메인 폴더도 빠지지 않도록 실제 폴더 목록에서 만든다
const COMPONENT_DOMAINS = fs
  .readdirSync(new URL("./src/components/", import.meta.url), {
    withFileTypes: true,
  })
  .filter((entry) => entry.isDirectory() && entry.name !== "common")
  .map((entry) => entry.name);
const SHARED_COMPONENT_DOMAINS = ["result"];

const COMPONENT_ZONES = [
  ...COMPONENT_DOMAINS.map((domain) => ({
    target: `./src/components/${domain}`,
    from: COMPONENT_DOMAINS.filter(
      (other) => other !== domain && !SHARED_COMPONENT_DOMAINS.includes(other)
    ).map((other) => `./src/components/${other}`),
    message:
      "components의 도메인 폴더끼리는 서로 가져오지 않습니다(공용은 common·result). 조합은 pages에서 합니다.",
  })),
  {
    target: "./src/components/common",
    from: COMPONENT_DOMAINS.map((domain) => `./src/components/${domain}`),
    message: "common은 도메인 컴포넌트를 가져오지 않습니다.",
  },
];

const LAYER_ZONES = [
  {
    target: "./src/ui",
    from: [
      "./src/app",
      "./src/pages",
      "./src/components",
      "./src/state",
      "./src/queries",
      "./src/apis",
      "./src/domain",
      "./src/lib",
      "./src/types",
    ],
    message:
      "ui(디자인 시스템)는 앱 레이어를 가져오지 않습니다. React와 ui 안의 파일만 씁니다.",
  },
  {
    target: [
      "./src/state",
      "./src/queries",
      "./src/apis",
      "./src/domain",
      "./src/lib",
      "./src/types",
    ],
    from: "./src/ui",
    message: "화면이 아닌 레이어는 ui를 가져오지 않습니다.",
  },
  {
    target: "./src/components",
    from: "./src/queries",
    message:
      "components는 props로 받은 데이터를 표현만 합니다. 서버 데이터 조회·변경은 pages나 app에서 합니다.",
  },
  ...COMPONENT_ZONES,
  {
    target: ["./src/components", "./src/pages"],
    from: "./src/apis",
    except: ["./errors.ts"],
    message:
      "화면 코드는 queries/ 훅을 쓰고, apis/에서는 apis/errors만 가져옵니다.",
  },
  {
    target: ["./src/components", "./src/pages"],
    from: "./src/app",
    except: ["./routes.ts"],
    message: "화면 코드는 app/에서 app/routes만 가져옵니다.",
  },
  {
    target: "./src/components",
    from: "./src/pages",
    message: "components는 pages를 가져오지 않습니다(조합은 pages에서).",
  },
  {
    target: "./src/state",
    from: [
      "./src/app",
      "./src/pages",
      "./src/components",
      "./src/queries",
      "./src/apis",
    ],
    message: "state는 화면·서버 상태 레이어를 가져오지 않습니다.",
  },
  {
    target: ["./src/apis", "./src/queries"],
    from: ["./src/app", "./src/pages", "./src/components", "./src/state"],
    message: "apis·queries는 화면·상태 레이어를 가져오지 않습니다.",
  },
  {
    target: "./src/apis",
    from: "./src/queries",
    message: "apis는 queries를 가져오지 않습니다.",
  },
  {
    target: ["./src/domain", "./src/lib"],
    from: [
      "./src/app",
      "./src/pages",
      "./src/components",
      "./src/state",
      "./src/queries",
      "./src/apis",
    ],
    message: "domain·lib는 상위 레이어를 가져오지 않습니다.",
  },
  {
    target: "./src/lib",
    from: "./src/domain",
    message: "lib는 범용 유틸이라 domain을 가져오지 않습니다.",
  },
  {
    target: "./src/types",
    from: [
      "./src/app",
      "./src/pages",
      "./src/components",
      "./src/state",
      "./src/queries",
      "./src/apis",
      "./src/domain",
      "./src/lib",
    ],
    message: "types는 다른 레이어를 가져오지 않습니다.",
  },
];

export default defineConfig([
  globalIgnores(["build", "coverage"]),

  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      eslintReact.configs["recommended-typescript"],
      jsxA11y.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: { "import-x": importX },
    settings: {
      "import-x/resolver-next": [createTypeScriptImportResolver()],
    },
    rules: {
      // { id, ...rest }처럼 일부 속성을 빼는 구조 분해는 허용한다
      "@typescript-eslint/no-unused-vars": [
        "error",
        { ignoreRestSiblings: true },
      ],
      "import-x/no-restricted-paths": ["error", { zones: LAYER_ZONES }],
      "import-x/first": "error",
      "import-x/no-duplicates": "error",
      ...Object.fromEntries(
        HOOK_RULES_FROM_REACT_HOOKS.map((name) => [
          `@eslint-react/${name}`,
          "off",
        ])
      ),
      // 컴포넌트 안 컴포넌트 정의는 react-hooks/static-components가 같은 것을 검사한다
      "@eslint-react/no-nested-component-definitions": "off",
      "@eslint-react/dom-no-unsafe-target-blank": "error",
      "import-x/no-anonymous-default-export": "error",

      // eslint-config-react-app이 켜던 규칙 중 TypeScript가 대신 잡지 못하는 것
      "array-callback-return": "error",
      eqeqeq: ["error", "smart"],
      "no-restricted-globals": ["error", ...confusingBrowserGlobals],
      "no-self-compare": "error",
      "no-template-curly-in-string": "error",
      "no-throw-literal": "error",
      "no-useless-concat": "error",
    },
  },

  // 화면 코드는 서버 통신 라이브러리를 직접 쓰지 않는다
  {
    files: ["src/components/**", "src/pages/**"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "axios",
              message: "API 호출은 apis/와 queries/ 훅을 통해서만 합니다.",
            },
            {
              name: "@tanstack/react-query",
              message: "서버 상태는 queries/의 훅으로만 다룹니다.",
            },
          ],
        },
      ],
    },
  },

  // 순수 레이어는 React·UI·HTTP·서버 상태에 의존하지 않는다
  {
    files: ["src/domain/**", "src/types/**", "src/lib/**"],
    ignores: TEST_FILES,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message: "domain·types·lib는 React에 의존하지 않습니다.",
            },
            {
              name: "axios",
              message: "domain·types·lib는 HTTP에 의존하지 않습니다.",
            },
            {
              name: "@tanstack/react-query",
              message: "domain·types·lib는 서버 상태에 의존하지 않습니다.",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/storage.ts", ...TEST_FILES],
    rules: {
      "no-restricted-syntax": [
        "error",
        "WithStatement",
        {
          selector: "Identifier[name='localStorage']",
          message:
            "localStorage는 lib/storage의 readJSON·writeJSON으로만 접근합니다.",
        },
        {
          selector: "ImportDeclaration[source.value=/^xlsx/]",
          message:
            "xlsx는 lib/excel에서 동적 import로만 불러옵니다(첫 화면 번들에서 제외).",
        },
      ],
    },
  },

  {
    files: TEST_FILES,
    extends: [vitest.configs.recommended, testingLibrary.configs["flat/react"]],
  },

  // ESLint 설정 파일 자체
  {
    files: ["eslint.config.js"],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },

  // 빌드 설정은 Node에서 실행된다
  {
    files: ["vite.config.ts"],
    languageOptions: { globals: globals.node },
  },
]);
