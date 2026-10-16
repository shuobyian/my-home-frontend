import MyHomeError from "apis/lib/error/MyHomeError";
import axios from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    pathParams?: Record<string, string>;
  }
}

const myAxios = axios.create();

myAxios.interceptors.request.use(async (config) => {
  if (!config.headers || !config.url) return config;

  const baseURL =
    process.env.REACT_APP_PROFILE === "DEV"
      ? "http://localhost:8123"
      : "http://43.200.90.33:8123";
  const currentUrl = new URL(`${baseURL}${config.url}`);

  Object.entries(config.pathParams || {}).forEach(([k, v]) => {
    currentUrl.pathname = currentUrl.pathname.replace(
      `:${k}`,
      encodeURIComponent(v)
    );
  });

  return {
    ...config,
    baseURL: `${currentUrl.protocol}//${currentUrl.host}`,
    url: currentUrl.pathname,
  };
});

// 모든 API 에러를 MyHomeError로 정규화한다 (응답이 없는 네트워크 오류 포함)
myAxios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(MyHomeError.from(error))
);

export default myAxios;
