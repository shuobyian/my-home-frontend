import { isChunkLoadError } from "lib/chunk";

describe("isChunkLoadError", () => {
  it("webpack 청크 로드 실패를 알아본다", () => {
    const named = new Error("Loading chunk 84 failed.");
    named.name = "ChunkLoadError";
    expect(isChunkLoadError(named)).toBe(true);
    expect(isChunkLoadError(new Error("Loading CSS chunk 12 failed."))).toBe(
      true
    );
  });

  it("다른 오류는 false", () => {
    expect(isChunkLoadError(new Error("Network Error"))).toBe(false);
    expect(isChunkLoadError("Loading chunk 1 failed")).toBe(false);
  });
});
