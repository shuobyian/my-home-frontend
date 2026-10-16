import { getItemImageUrl } from "lib/image";

describe("getItemImageUrl", () => {
  it("물품명을 인코딩한 jpg 경로를 만든다", () => {
    expect(getItemImageUrl("나무 의자")).toBe(
      `${process.env.PUBLIC_URL}/images/%EB%82%98%EB%AC%B4%20%EC%9D%98%EC%9E%90.jpg`
    );
    expect(getItemImageUrl("A#1?")).toBe(
      `${process.env.PUBLIC_URL}/images/A%231%3F.jpg`
    );
  });
});
