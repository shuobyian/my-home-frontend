import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProductTableView } from "@/components/product/ProductTableView";
import { CatalogNames } from "@/domain/catalog";
import { createProduct } from "@/test/fixtures";
import { Product } from "@/types/product";
import { Text, UIProvider } from "@/ui";
import { ComponentProps } from "react";

const chair = createProduct({ id: 1, name: "의자" });
const names: CatalogNames = {
  markets: new Set(["원목"]),
  products: new Set(["의자"]),
};

function renderTable(
  props: Partial<ComponentProps<typeof ProductTableView>> = {}
) {
  const handlers = {
    onAdd: vi.fn(() => Promise.resolve()),
    onEdit: vi.fn(() => Promise.resolve()),
    onRemove: vi.fn(() => Promise.resolve()),
  };
  render(
    <UIProvider>
      <ProductTableView products={[chair]} total={1} {...handlers} {...props} />
    </UIProvider>
  );
  return handlers;
}

const headers = () =>
  screen
    .getAllByRole("columnheader")
    .map((header) => header.textContent)
    .filter(Boolean);

describe("ProductTableView", () => {
  it("renderStatus가 있으면 물품명 다음에 상태 열을 둔다", () => {
    renderTable({
      renderStatus: (product: Product) => (
        <Text tone='success'>{product.name} 정상</Text>
      ),
    });

    expect(headers().slice(0, 3)).toEqual(["물품명", "상태", "레벨"]);
    expect(screen.getByText("의자 정상")).toBeInTheDocument();
  });

  it("renderStatus가 없으면 상태 열이 없다", () => {
    renderTable();

    expect(headers()).not.toContain("상태");
  });

  it("모달에 시세·물품 이름을 넘기고, 수정하면 새 시세와 함께 onEdit을 부른다", async () => {
    const { onEdit } = renderTable({
      catalogNames: names,
      requireNewMarketPrices: true,
    });

    fireEvent.click(screen.getByText("의자"));
    // 이름 후보(datalist)가 붙으면 재료 이름 입력은 combobox 역할이다
    expect(
      screen.getByRole("combobox", { name: "물품명" })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "수정" }));

    await waitFor(() => expect(onEdit).toHaveBeenCalledWith(chair, []));
  });
});
