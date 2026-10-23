import { AppProviders } from "@/app/providers";
import { AppRoutes } from "@/app/router";
import { trackChunkLoadErrors } from "@/lib/chunk";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/ui/global.css";
import "./index.css";

// 배포 후 지연 로딩 코드를 받지 못하면 새로고침을 안내하기 위해 실패를 기록한다
trackChunkLoadErrors(window);

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <StrictMode>
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  </StrictMode>
);
