import { readJSON, removeItem, writeJSON } from "lib/storage";

beforeEach(() => {
  localStorage.clear();
});

describe("storage", () => {
  it("writeJSON으로 저장한 값을 readJSON으로 읽는다", () => {
    writeJSON("key", { a: [1, 2] });
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
    const spy = jest
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

    expect(() => writeJSON("key", 1)).not.toThrow();
    spy.mockRestore();
  });

  it("removeItem은 값을 지운다", () => {
    writeJSON("key", 1);
    removeItem("key");
    expect(readJSON("key")).toBeUndefined();
  });
});
