import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { readJSON, removeItem, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { ManageHomePage } from "@/pages/manage/ManageHomePage";
import { createProduct } from "@/test/fixtures";
import { Market } from "@/types/market";
import { Product } from "@/types/product";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const api = vi.hoisted(() => ({
  fetchAllProducts: vi.fn(),
  createProducts: vi.fn(),
  fetchMarkets: vi.fn(),
  updateMarkets: vi.fn(),
}));
vi.mock("@/apis/product", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchAllProducts: () => api.fetchAllProducts(),
  createProducts: (body: unknown) => api.createProducts(body),
}));
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchMarkets: () => api.fetchMarkets(),
  updateMarkets: (body: unknown) => api.updateMarkets(body),
}));

const wood: Market = { id: 1, name: "원목", price: 500 };
// 서버에 있는 물품
const chair = createProduct({ id: 1, name: "나무 의자" });
// 서버에 없는 새 물품(서버의 나무 의자를 하위재료로 쓴다)
const table = createProduct({
  id: 2,
  name: "식탁",
  materials: [
    { name: "나무 의자", basic: false, count: 4 },
    { name: "원목", basic: true, count: 2 },
  ],
});
// 올린 적이 있지만 서버에서 지워진 물품
const desk = createProduct({ id: 3, name: "책상" });

const draft = () => readJSON(STORAGE_KEY.PRODUCT) as Product[];
const knownNames = () => readJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES);
const withoutId = ({ id, ...product }: Product) => product;

function renderPage() {
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <ManageHomePage />
      </UIProvider>
    </QueryClientProvider>
  );
}

// 서버 목록과 비교가 끝났다는 표시(추가할 새 물품 수)
const planned = (count: number) =>
  screen.findByText(`추가할 새 물품 ${count}개`);

// 물품명 칸으로 Raw 표의 행을 찾는다
const rowOf = (name: string) => {
  const row = screen
    .getAllByRole("row")
    .find((element) => within(element).queryByText(name));
  if (!row) throw new Error(`${name} 행이 없습니다`);
  return row;
};

const saveButton = () => screen.getByRole("button", { name: "저장" });

beforeEach(() => {
  localStorage.clear();
  // 처음 실행(올린 이름 기록 없음)은 따로 본다
  writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, []);
  api.fetchAllProducts.mockResolvedValue([chair]);
  api.fetchMarkets.mockResolvedValue([wood]);
  api.updateMarkets.mockResolvedValue([]);
  api.createProducts.mockImplementation(
    async ({ products }: { products: Omit<Product, "id">[] }) =>
      products.map((product, index) => ({ id: 10 + index, ...product }))
  );
});

describe("ManageHomePage", () => {
  it("행을 고치면 저장 버튼을 누르지 않아도 초안에 바로 남는다", async () => {
    writeJSON(STORAGE_KEY.PRODUCT, [chair]);
    renderPage();
    await planned(0);

    fireEvent.click(screen.getByText("나무 의자"));
    const dialog = await screen.findByRole("dialog", {
      name: "나무 의자 정보 수정",
    });
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "레벨" }), {
      target: { value: "5" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));

    await waitFor(() => expect(draft()).toEqual([{ ...chair, level: 5 }]));
    // 서버와 내용이 달라졌지만 Raw 저장으로는 반영되지 않는다고 알린다
    expect(
      within(rowOf("나무 의자")).getByText("서버와 다름")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "서버와 내용이 다른 1개는 반영되지 않습니다. '물품 리스트'에서 수정하세요."
      )
    ).toBeInTheDocument();
  });

  it("서버에 없는 새 물품만 id 없이 올리고, 올린 이름을 기억한다", async () => {
    writeJSON(STORAGE_KEY.PRODUCT, [chair, table]);
    writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, ["나무 의자"]);
    renderPage();
    await planned(1);
    expect(
      within(rowOf("나무 의자")).getByText("서버에 있음")
    ).toBeInTheDocument();
    expect(within(rowOf("식탁")).getByText("새 물품")).toBeInTheDocument();

    fireEvent.click(saveButton());
    const dialog = await screen.findByRole("dialog", {
      name: "서버에 저장하시겠습니까?",
    });
    expect(dialog).toHaveTextContent(
      "추가할 물품 1개를 서버에 올리고 결과도 만듭니다."
    );
    // 저장 직전에 최신 서버 목록으로 다시 계산한다
    expect(api.fetchAllProducts).toHaveBeenCalledTimes(2);
    fireEvent.click(within(dialog).getByRole("button", { name: "저장" }));

    expect(
      await screen.findByRole("dialog", {
        name: "1개 물품을 추가하고 결과도 만들었습니다.",
      })
    ).toBeInTheDocument();
    expect(api.createProducts).toHaveBeenCalledWith({
      products: [withoutId(table)],
    });
    expect(knownNames()).toEqual(["나무 의자", "식탁"]);
  });

  it("서버에서 지워진 물품은 올리지 않고 알리며, Raw 목록에서 뺄 수 있다", async () => {
    writeJSON(STORAGE_KEY.PRODUCT, [chair, desk, table]);
    writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, ["나무 의자", "책상"]);
    renderPage();
    await planned(1);

    expect(
      screen.getByText(
        "서버에서 지워졌거나 이름이 바뀐 물품 1개는 올리지 않습니다."
      )
    ).toBeInTheDocument();
    expect(
      within(rowOf("책상")).getByText("서버에서 삭제됨")
    ).toBeInTheDocument();

    fireEvent.click(saveButton());
    const dialog = await screen.findByRole("dialog", {
      name: "서버에 저장하시겠습니까?",
    });
    // 올린 뒤에는 서버 목록에 식탁이 있다
    api.fetchAllProducts.mockResolvedValue([chair, { ...table, id: 10 }]);
    fireEvent.click(within(dialog).getByRole("button", { name: "저장" }));
    await waitFor(() =>
      expect(api.createProducts).toHaveBeenCalledWith({
        products: [withoutId(table)],
      })
    );
    expect(await planned(0)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Raw 목록에서 빼기" }));
    fireEvent.click(
      within(
        await screen.findByRole("dialog", {
          name: "1개 물품을 Raw 목록에서 빼시겠습니까?",
        })
      ).getByRole("button", { name: "빼기" })
    );
    await waitFor(() =>
      expect(draft().map(({ name }) => name)).toEqual(["나무 의자", "식탁"])
    );
  });

  it("시세 없는 재료가 있으면 저장할 수 없고, 시세를 추가하면 다시 계산해 저장할 수 있다", async () => {
    const ring = createProduct({
      id: 4,
      name: "반지",
      materials: [{ name: "은", basic: true, count: 1 }],
    });
    writeJSON(STORAGE_KEY.PRODUCT, [ring]);
    renderPage();
    await planned(1);

    expect(screen.getByText("은 (쓰는 물품: 반지)")).toBeInTheDocument();
    expect(
      within(rowOf("반지")).getByText("새 물품 · 확인 필요")
    ).toHaveAttribute("title", "은: 시세에 없는 새 재료입니다.");
    expect(saveButton()).toBeDisabled();

    api.fetchMarkets.mockResolvedValue([
      wood,
      { id: 2, name: "은", price: 300 },
    ]);
    fireEvent.click(screen.getByRole("button", { name: "시세 추가" }));
    const dialog = await screen.findByRole("dialog", { name: "시세 추가" });
    expect(dialog).toHaveTextContent("쓰는 물품: 반지");
    fireEvent.change(within(dialog).getByLabelText("은 시세"), {
      target: { value: "300" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "추가" }));

    expect(
      await screen.findByText("시세 1개를 추가했습니다.")
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledWith([
      { name: "은", price: 300 },
    ]);
    await waitFor(() => expect(saveButton()).toBeEnabled());
    expect(screen.queryByText("은 (쓰는 물품: 반지)")).not.toBeInTheDocument();
  });

  it("재료 참조가 잘못되었거나 새 물품 이름이 겹치면 저장할 수 없다", async () => {
    const wrongRef = createProduct({
      id: 4,
      name: "반지",
      materials: [{ name: "원목", basic: false, count: 1 }],
    });
    writeJSON(STORAGE_KEY.PRODUCT, [wrongRef, { ...table, id: 5 }, table]);
    renderPage();
    await planned(3);

    expect(
      screen.getByText(
        "반지: 원목 - 시세 재료 이름입니다. '최하위재료'로 바꾸세요."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "같은 이름의 새 물품이 여러 번 있어 저장할 수 없습니다. (식탁)"
      )
    ).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it("저장 직전에 받은 서버 목록에 같은 이름이 생겼으면 올리지 않는다", async () => {
    writeJSON(STORAGE_KEY.PRODUCT, [chair, table]);
    renderPage();
    await planned(1);

    api.fetchAllProducts.mockResolvedValue([chair, table]);
    fireEvent.click(saveButton());

    expect(
      await screen.findByText(
        "최신 서버 목록과 비교하니 올릴 수 없습니다. 위 안내를 확인해주세요."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "서버에 저장하시겠습니까?" })
    ).not.toBeInTheDocument();
    expect(api.createProducts).not.toHaveBeenCalled();
  });

  it("올리기가 실패하면 알림창을 띄우고, 다시 열어도 같은 물품을 올릴 수 있다", async () => {
    api.createProducts.mockRejectedValue(
      new MyHomeError({
        message: "시세 정보가 없는 재료가 있습니다. (식탁: 원목)",
      })
    );
    writeJSON(STORAGE_KEY.PRODUCT, [chair, table]);
    writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, ["나무 의자"]);
    const { unmount } = renderPage();
    await planned(1);

    fireEvent.click(saveButton());
    fireEvent.click(
      within(
        await screen.findByRole("dialog", { name: "서버에 저장하시겠습니까?" })
      ).getByRole("button", { name: "저장" })
    );
    expect(
      await screen.findByRole("dialog", { name: "저장하지 못했습니다" })
    ).toHaveTextContent("시세 정보가 없는 재료가 있습니다. (식탁: 원목)");
    expect(knownNames()).toEqual(["나무 의자"]);
    unmount();

    renderPage();
    await planned(1);
    expect(within(rowOf("식탁")).getByText("새 물품")).toBeInTheDocument();
    expect(saveButton()).toBeEnabled();
  });

  it("서버 목록 불러오기는 확인 뒤 Raw 목록을 서버 물품으로 바꾼다", async () => {
    const serverTable = {
      ...table,
      id: 7,
      // 서버 응답의 재료에는 id가 붙어 있다
      materials: table.materials.map((material, index) => ({
        ...material,
        id: index + 1,
      })),
    };
    api.fetchAllProducts.mockResolvedValue([chair, serverTable]);
    writeJSON(STORAGE_KEY.PRODUCT, [desk]);
    writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, []);
    renderPage();
    await planned(1);

    fireEvent.click(screen.getByRole("button", { name: "서버 목록 불러오기" }));
    const dialog = await screen.findByRole("dialog", {
      name: "서버 목록을 불러오시겠습니까?",
    });
    expect(dialog).toHaveTextContent(
      "Raw 목록을 서버 물품 2개로 바꿉니다. 올리지 않은 Raw 변경은 사라집니다."
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "불러오기" }));

    await waitFor(() => expect(draft()).toEqual([chair, { ...table, id: 7 }]));
    expect(await planned(0)).toBeInTheDocument();
    expect(knownNames()).toEqual(["나무 의자", "식탁"]);
  });

  it("처음 실행이면 마운트 때 초안 이름과 서버 이름을 올린 적 있는 이름으로 정한다", async () => {
    // 이전 버전은 my-home-product에 마지막으로 서버에 올린 목록을 저장했다
    removeItem(STORAGE_KEY.PRODUCT_KNOWN_NAMES);
    writeJSON(STORAGE_KEY.PRODUCT, [chair, desk]);
    api.fetchAllProducts.mockResolvedValue([
      chair,
      createProduct({ id: 5, name: "의자" }),
    ]);
    renderPage();
    await planned(0);

    expect(knownNames()).toEqual(["나무 의자", "책상", "의자"]);
    // 책상은 올린 적이 있는데 서버에 없으므로 새 물품이 아니다
    expect(
      within(rowOf("책상")).getByText("서버에서 삭제됨")
    ).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
  });

  it("처음 실행 초안에 같은 이름이 여러 번 있어도 서버 이름을 빠뜨리지 않는다", async () => {
    removeItem(STORAGE_KEY.PRODUCT_KNOWN_NAMES);
    writeJSON(STORAGE_KEY.PRODUCT, [chair, { ...chair, id: 2 }, desk]);
    api.fetchAllProducts.mockResolvedValue([
      chair,
      createProduct({ id: 5, name: "의자" }),
    ]);
    renderPage();
    await planned(0);

    await waitFor(() =>
      expect(knownNames()).toEqual(["나무 의자", "책상", "의자"])
    );
  });

  it("기록된 이름에 중복이 있어도, 중복 수만큼 들어온 새 이름을 빠뜨리지 않는다", async () => {
    // 이전 버전은 같은 이름을 여러 번 기록할 수 있었다
    writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, ["나무 의자", "나무 의자"]);
    writeJSON(STORAGE_KEY.PRODUCT, [chair]);
    api.fetchAllProducts.mockResolvedValue([
      chair,
      createProduct({ id: 5, name: "의자" }),
    ]);
    const { unmount } = renderPage();
    await planned(0);
    await waitFor(() => expect(knownNames()).toEqual(["나무 의자", "의자"]));
    unmount();

    // 서버에서 의자가 지워진 뒤에도 초안의 의자는 새 물품이 아니라 지워진 물품이다
    writeJSON(STORAGE_KEY.PRODUCT, [
      chair,
      createProduct({ id: 5, name: "의자" }),
    ]);
    api.fetchAllProducts.mockResolvedValue([chair]);
    renderPage();
    await planned(0);
    expect(
      within(rowOf("의자")).getByText("서버에서 삭제됨")
    ).toBeInTheDocument();
  });

  it("서버 목록을 받지 못하면 저장할 수 없다고 알리고 편집은 계속할 수 있다", async () => {
    api.fetchMarkets.mockRejectedValue(new MyHomeError({ message: "실패" }));
    writeJSON(STORAGE_KEY.PRODUCT, [chair, table]);
    renderPage();

    expect(
      await screen.findByText(
        "서버 물품·시세 목록을 불러오지 못해 무엇을 올릴지 알 수 없습니다. 새로고침 후 다시 시도해주세요."
      )
    ).toBeInTheDocument();
    expect(saveButton()).toBeDisabled();
    expect(within(rowOf("식탁")).getByText("-")).toBeInTheDocument();
  });
});
