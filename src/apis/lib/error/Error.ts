export interface IErrorResponse<T> {
  response: {
    config: {
      adapter: Function;
      cancelToken: {
        promise: Promise<unknown>;
      };
      data: any;
      headers: any;
      maxContentLength: number;
      method: string;
      responseType: string;
      timeout: number;
      transformRequest: [Function];
      transformResponse: [Function];
      url: string;
      validateStatus: Function;
      xsrfCookieName: string;
      xsrfHeaderName: string;
    };
    data: T;
    headers: { [key: string]: string };
    request: XMLHttpRequest;
    status: number;
    statusText: string;
  };
}

export interface IMyHomeError {
  statusCode: string;
  message: string;
  error: string;
}
