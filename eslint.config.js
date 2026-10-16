// @ts-check
import eslintReact from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y-x";
import reactHooks from "eslint-plugin-react-hooks";
import testingLibrary from "eslint-plugin-testing-library";
import { defineConfig, globalIgnores } from "eslint/config";
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
];
const LAYER_ZONES = [
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
              name: "antd",
              message: "domain·types·lib는 UI 라이브러리에 의존하지 않습니다.",
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

  // 빌드 설정은 Node에서 실행된다
  {
    files: ["vite.config.ts"],
    languageOptions: { globals: globals.node },
  },
]);
