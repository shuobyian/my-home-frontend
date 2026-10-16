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
    // antd 묶음(gzip 약 270kB)은 한 덩어리로 캐시하므로 경고 기준을 그보다 크게 둔다
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        // 자주 바뀌지 않는 라이브러리를 앱 코드와 나눠 배포 후에도 브라우저 캐시를 쓰게 한다.
        // xlsx는 엑셀 기능을 쓸 때만 받도록 여기에 넣지 않는다.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|@remix-run)[\\/]/,
              priority: 2,
            },
            {
              name: "antd",
              test: /[\\/]node_modules[\\/](antd|@ant-design|rc-[^\\/]+|@rc-component)[\\/]/,
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
    // 테스트마다 spy·mock을 원래대로 되돌린다(CRA의 resetMocks와 같은 목적)
    restoreMocks: true,
  },
});
