import { IErrorResponse, IMyHomeError } from "apis/lib/error/Error";
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

myAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(
      new MyHomeError({
        request: error.response.request.responseURL,
        errorResponse: error as IErrorResponse<IMyHomeError>,
      })
    );
  }
);

export default myAxios;
