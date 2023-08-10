import axios from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    pathParams?: Record<string, string>;
  }
}

const myAxios = axios.create();

myAxios.interceptors.request.use(async (config) => {
  if (!config.headers || !config.url) return config;

  // TODO
  const baseURL = "http://localhost:8123";
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
    return Promise.reject(error);
  }
);

export default myAxios;
