import { isChunkLoadError } from "@/lib/chunk";

describe("isChunkLoadError", () => {
  it("브라우저별 동적 import 실패 메시지를 알아본다", () => {
    [
      "Failed to fetch dynamically imported module: http://x/assets/a.js",
      "error loading dynamically imported module: http://x/assets/a.js",
      "Importing a module script failed.",
    ].forEach((message) =>
      expect(isChunkLoadError(new TypeError(message))).toBe(true)
    );
  });

  it("다른 오류는 false", () => {
    expect(isChunkLoadError(new Error("Network Error"))).toBe(false);
    expect(
      isChunkLoadError("Failed to fetch dynamically imported module")
    ).toBe(false);
  });
});
