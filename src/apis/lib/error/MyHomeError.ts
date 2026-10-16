import { IMyHomeError } from "apis/lib/error/Error";
import axios from "axios";

const UNKNOWN_ERROR_MESSAGE = "알 수 없는 오류가 발생했습니다.";
const NETWORK_ERROR_MESSAGE =
  "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";

export default class MyHomeError extends Error {
  // 요청 url
  request?: string;
  // HTTP 상태 코드 (응답을 받지 못한 경우 없음)
  status?: number;
  // 서버 에러 응답 본문
  data?: Partial<IMyHomeError>;

  constructor({
    message,
    request,
    status,
    data,
  }: {
    message: string;
    request?: string;
    status?: number;
    data?: Partial<IMyHomeError>;
  }) {
    super(message);
    // Babel로 Error를 상속하면 prototype이 끊길 수 있어 instanceof를 보장한다
    Object.setPrototypeOf(this, MyHomeError.prototype);
    this.name = "MyHomeError";
    this.request = request;
    this.status = status;
    this.data = data;
  }

  // axios 에러를 포함한 모든 에러를 MyHomeError로 정규화한다.
  // 응답이 없는 네트워크·CORS·타임아웃 오류도 메시지를 갖는다.
  static from(error: unknown): MyHomeError {
    if (error instanceof MyHomeError) return error;

    if (axios.isAxiosError(error)) {
      const { response, config } = error;
      if (!response) {
        return new MyHomeError({
          message: NETWORK_ERROR_MESSAGE,
          request: config?.url,
        });
      }

      const data = response.data as Partial<IMyHomeError> | undefined;
      return new MyHomeError({
        message:
          typeof data?.message === "string" && data.message
            ? data.message
            : UNKNOWN_ERROR_MESSAGE,
        request: response.request?.responseURL ?? config?.url,
        status: response.status,
        data,
      });
    }

    return new MyHomeError({ message: UNKNOWN_ERROR_MESSAGE });
  }

  public getErrorMessage() {
    return this.message || UNKNOWN_ERROR_MESSAGE;
  }
}

// 화면에 보여 줄 에러 메시지. 어떤 값이 던져져도 예외 없이 문자열을 반환한다.
export function getErrorMessage(error: unknown) {
  return MyHomeError.from(error).getErrorMessage();
}
