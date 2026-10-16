import { isChunkLoadError, trackChunkLoadErrors } from "@/lib/chunk";

describe("isChunkLoadError", () => {
  it("브라우저별 동적 import 실패 메시지를 알아본다", () => {
    [
      "Failed to fetch dynamically imported module: http://x/assets/a.js",
      "error loading dynamically imported module: http://x/assets/a.js",
      "Importing a module script failed.",
      "'text/html' is not a valid JavaScript MIME type for module script 'http://x/assets/a.js'.",
      "Unable to preload CSS for /assets/a.css",
    ].forEach((message) =>
      expect(isChunkLoadError(new TypeError(message))).toBe(true)
    );
  });

  it("Vite가 vite:preloadError로 알린 에러는 메시지와 관계없이 알아본다", () => {
    trackChunkLoadErrors(window);
    const error = new TypeError("브라우저마다 다른 메시지");
    expect(isChunkLoadError(error)).toBe(false);

    window.dispatchEvent(
      Object.assign(new Event("vite:preloadError", { cancelable: true }), {
        payload: error,
      })
    );

    expect(isChunkLoadError(error)).toBe(true);
  });

  it("다른 오류는 false", () => {
    expect(isChunkLoadError(new Error("Network Error"))).toBe(false);
    expect(
      isChunkLoadError("Failed to fetch dynamically imported module")
    ).toBe(false);
  });
});
