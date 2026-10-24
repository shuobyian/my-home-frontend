import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { useInvalidateCatalog } from "@/queries/invalidate";
import { experienceKeys, productKeys } from "@/queries/keys";
import { ReactNode } from "react";

function setup() {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useInvalidateCatalog(), { wrapper });
  return { queryClient, invalidate: result.current };
}

describe("useInvalidateCatalog", () => {
  it("물품·시세·결과·계산기·점검·호두작 계산을 함께 무효화하고, 경험치 표는 두지 않는다", () => {
    const { queryClient, invalidate } = setup();
    const keys = [
      productKeys.list({ page: 0, size: 10 }),
      productKeys.allList,
      ["market"],
      ["result", "list", { page: 0, size: 10 }],
      ["calculator", { markets: [] }],
      ["catalog", "check"],
      experienceKeys.walnut({ presentLevel: 1 }),
      experienceKeys.list(),
    ];
    keys.forEach((key) => queryClient.setQueryData(key, 1));

    invalidate();

    const invalidated = keys.map(
      (key) => queryClient.getQueryState(key)?.isInvalidated
    );
    expect(invalidated).toEqual([
      true,
      true,
      true,
      true,
      true,
      true,
      true,
      false,
    ]);
  });
});
