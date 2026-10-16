import { ConfigProvider } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App";
import "./index.css";

import locale from "antd/lib/locale/ko_KR";

ConfigProvider.config({
  theme: {
    primaryColor: "#5c3572",
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      useErrorBoundary: true,
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={locale}>
        <App />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
