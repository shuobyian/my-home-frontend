/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
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
    // antd 묶음(gzip 약 290kB)은 한 덩어리로 캐시하므로 경고 기준을 그보다 크게 둔다
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리를 앱 코드와 나눠 배포 후에도 브라우저 캐시를 쓰게 한다.
        // xlsx는 엑셀 기능을 쓸 때만 받도록 여기에 넣지 않는다.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/,
              priority: 2,
            },
            {
              name: "antd",
              // antd 6부터 하위 컴포넌트는 모두 @rc-component/* 패키지다(rc-* 패키지는 쓰지 않는다)
              test: /[\\/]node_modules[\\/](antd|@ant-design|@rc-component)[\\/]/,
              priority: 1,
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
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // 테스트마다 spy를 원래대로 되돌리고(restoreMocks) 모의 함수의 구현·대기열을 지운다(mockReset).
    // CRA의 resetMocks와 같은 효과로, 앞 테스트의 설정이 다음 테스트로 새지 않게 한다.
    restoreMocks: true,
    mockReset: true,
  },
});
