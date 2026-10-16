import {
  readJSON,
  readSession,
  removeItem,
  removeSession,
  writeJSON,
  writeSession,
} from "@/lib/storage";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("storage", () => {
  it("writeJSON으로 저장한 값을 readJSON으로 읽는다", () => {
    expect(writeJSON("key", { a: [1, 2] })).toBe(true);
    expect(readJSON("key")).toEqual({ a: [1, 2] });
  });

  it("없는 키는 undefined를 반환한다", () => {
    expect(readJSON("none")).toBeUndefined();
  });

  it("손상된 값은 예외 없이 undefined를 반환한다", () => {
    localStorage.setItem("broken", "{not json");
    expect(readJSON("broken")).toBeUndefined();
  });

  it("저장소 접근이 실패해도 예외를 던지지 않는다", () => {
    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    expect(writeJSON("key", 1)).toBe(false);
    spy.mockRestore();
  });

  it("removeItem은 값을 지운다", () => {
    writeJSON("key", 1);
    removeItem("key");
    expect(readJSON("key")).toBeUndefined();
  });
});

describe("session", () => {
  it("sessionStorage에 저장·읽기·삭제한다", () => {
    expect(writeSession("s", true)).toBe(true);
    expect(readSession("s")).toBe(true);
    expect(localStorage.getItem("s")).toBeNull();
    removeSession("s");
    expect(readSession("s")).toBeUndefined();
  });

  it("손상된 값이나 저장 실패에도 예외를 던지지 않는다", () => {
    sessionStorage.setItem("broken", "{not json");
    expect(readSession("broken")).toBeUndefined();

    const spy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });
    expect(writeSession("s", true)).toBe(false);
    spy.mockRestore();
  });
});
