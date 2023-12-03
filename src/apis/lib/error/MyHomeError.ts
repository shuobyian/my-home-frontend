/* prettier-ignore */

import { IErrorResponse, IMyHomeError } from "apis/lib/error/Error";

export default class MyHomeError extends Error {
  // 요청 url
  request?: string;
  // 에러 응답
  errorResponse?: IErrorResponse<IMyHomeError>;

  constructor({
    request,
    errorResponse,
  }: {
    request?: string;
    errorResponse: IErrorResponse<IMyHomeError>;
  }) {
    super();
    this.request = request;
    this.errorResponse = errorResponse;
  }

  public getErrorMessage() {
    return (
      this.errorResponse?.response?.data?.message ??
      "알 수 없는 오류가 발생했습니다."
    );
  }
}
