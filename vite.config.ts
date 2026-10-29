/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // css prop을 쓰려고 JSX를 emotion의 jsx로 바꾼다(tsconfig의 jsxImportSource와 같은 값)
  plugins: [react({ jsxImportSource: "@emotion/react" })],
  // tsconfig의 paths(@/* → src/*)를 그대로 쓴다
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
  },
  build: {
    // 배포 경로를 바꾸지 않도록 CRA와 같은 build/에 출력한다
    outDir: "build",
    // 지원 브라우저 하한을 명시한다(Vite 기본값은 Safari 16.4·Chrome 111).
    // 이보다 새 문법은 빌드 때 낮춘다.
    target: ["es2020", "chrome87", "edge88", "firefox78", "safari14"],
    rolldownOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리를 앱 코드와 나눠 배포 후에도 브라우저 캐시를 쓰게 한다.
        // xlsx는 엑셀 기능을 쓸 때만 받도록 여기에 넣지 않는다.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/setupTests.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
    ],
    // 테스트마다 spy를 원래대로 되돌리고(restoreMocks) 모의 함수의 구현·대기열을 지운다(mockReset).
    // CRA의 resetMocks와 같은 효과로, 앞 테스트의 설정이 다음 테스트로 새지 않게 한다.
    restoreMocks: true,
    mockReset: true,
  },
});
