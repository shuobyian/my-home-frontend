import { fireEvent, render, screen } from "@testing-library/react";
import { CartButton } from "@/components/cart/CartButton";
import { STORAGE_KEY } from "@/lib/storage";
import { MemoryRouter } from "react-router";
import { CartProvider } from "@/state/cart";
import { createResult } from "@/test/fixtures";
import { UIProvider } from "@/ui";

function renderButton() {
  return render(
    <UIProvider>
      <CartProvider>
        <MemoryRouter>
          <CartButton />
        </MemoryRouter>
      </CartProvider>
    </UIProvider>
  );
}

// CartProvider는 마운트할 때 저장된 장바구니를 읽는다
function saveCart(counts: number[]) {
  const cart = Object.fromEntries(
    counts.map((count, index) => {
      const item = createResult({ id: index + 1, name: `물품 ${index + 1}` });
      const key = `server:${item.id}`;
      return [key, { key, source: "server", item, count }];
    })
  );
  localStorage.setItem(STORAGE_KEY.CART, JSON.stringify(cart));
}

beforeEach(() => {
  localStorage.clear();
});

describe("CartButton", () => {
  it("비어 있으면 수량 없이 '장바구니'로 보이고, 누르면 장바구니 서랍을 연다", async () => {
    renderButton();

    expect(screen.queryByText("0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "장바구니" }));

    expect(
      await screen.findByRole("dialog", { name: "장바구니" })
    ).toBeInTheDocument();
    expect(screen.getByText("담긴 물품이 없습니다.")).toBeInTheDocument();
  });

  it("담긴 수량을 버튼에 보여 주고 접근 이름에는 '개'를 붙인다", () => {
    saveCart([2, 3]);
    renderButton();

    expect(
      screen.getByRole("button", { name: "장바구니 5개" })
    ).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("수량이 99를 넘으면 99+로 줄여 보여 준다", () => {
    saveCart([100]);
    renderButton();

    expect(screen.getByText("99+")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "장바구니 100개" })
    ).toBeInTheDocument();
  });

  it("서랍을 열면 담긴 물품을 보여 주고, 닫을 수 있다", async () => {
    saveCart([2]);
    renderButton();

    fireEvent.click(screen.getByRole("button", { name: "장바구니 2개" }));

    const dialog = await screen.findByRole("dialog", { name: "장바구니" });
    expect(dialog).toHaveTextContent("물품 1");

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
