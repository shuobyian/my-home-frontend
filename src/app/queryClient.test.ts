import { MutationObserver, onlineManager } from "@tanstack/react-query";
import { queryClient } from "app/queryClient";

afterEach(() => {
  onlineManager.setOnline(true);
  queryClient.clear();
});

describe("queryClient 기본 설정", () => {
  it("오프라인이어도 쿼리 요청을 보내 실패를 바로 알린다(멈추지 않음)", async () => {
    onlineManager.setOnline(false);
    const queryFn = jest.fn().mockRejectedValue(new Error("Network Error"));

    await expect(
      queryClient.fetchQuery({ queryKey: ["offline"], queryFn })
    ).rejects.toThrow("Network Error");
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("오프라인이어도 뮤테이션 요청을 보내 실패를 바로 알린다", async () => {
    onlineManager.setOnline(false);
    const mutationFn = jest.fn().mockRejectedValue(new Error("Network Error"));
    const observer = new MutationObserver(queryClient, { mutationFn });

    await expect(observer.mutate("값")).rejects.toThrow("Network Error");
    expect(mutationFn).toHaveBeenCalledTimes(1);
  });
});
