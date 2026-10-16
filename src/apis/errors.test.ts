import { getErrorMessage, MyHomeError } from "@/apis/errors";
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";

const config = {
  url: "/product",
  headers: new AxiosHeaders(),
} as InternalAxiosRequestConfig;

function axiosErrorWithResponse(status: number, data: unknown) {
  return new AxiosError("Request failed", "ERR_BAD_RESPONSE", config, null, {
    status,
    statusText: "",
    headers: {},
    config,
    data,
    request: { responseURL: "http://localhost:8123/product" },
  });
}

describe("MyHomeError.from", () => {
  it("서버 에러 응답의 message와 상태 코드를 담는다", () => {
    const error = MyHomeError.from(
      axiosErrorWithResponse(400, {
        statusCode: 400,
        message: "이미 존재하는 물품입니다.",
        error: "Bad Request",
      })
    );

    expect(error).toBeInstanceOf(MyHomeError);
    expect(error.getErrorMessage()).toBe("이미 존재하는 물품입니다.");
    expect(error.status).toBe(400);
    expect(error.data?.statusCode).toBe(400);
  });

  it("5xx 응답 본문(error 키 없음)의 message를 쓴다", () => {
    const error = MyHomeError.from(
      axiosErrorWithResponse(500, {
        statusCode: 500,
        message: "Internal server error",
      })
    );

    expect(error.getErrorMessage()).toBe("Internal server error");
    expect(error.status).toBe(500);
  });

  it("응답 본문에 message가 없으면 알 수 없는 오류 메시지를 쓴다", () => {
    const error = MyHomeError.from(axiosErrorWithResponse(500, "<html>"));

    expect(error.getErrorMessage()).toBe("알 수 없는 오류가 발생했습니다.");
    expect(error.status).toBe(500);
  });

  it("응답이 없는 네트워크 오류도 예외 없이 메시지를 갖는다", () => {
    const error = MyHomeError.from(
      new AxiosError("Network Error", "ERR_NETWORK", config)
    );

    expect(error.getErrorMessage()).toBe(
      "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요."
    );
    expect(error.status).toBeUndefined();
  });

  it("이미 MyHomeError면 그대로 반환한다", () => {
    const original = new MyHomeError({ message: "원래 오류" });

    expect(MyHomeError.from(original)).toBe(original);
  });
});

describe("getErrorMessage", () => {
  it.each([new TypeError("x is undefined"), "문자열", undefined, null])(
    "axios 에러가 아닌 값(%p)이면 알 수 없는 오류 메시지를 반환한다",
    (value) => {
      expect(getErrorMessage(value)).toBe("알 수 없는 오류가 발생했습니다.");
    }
  );
});
