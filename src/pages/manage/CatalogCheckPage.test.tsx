import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MyHomeError } from "@/apis/errors";
import { CatalogCheckPage } from "@/pages/manage/CatalogCheckPage";
import {
  createCatalogCheck,
  createProblem,
  createProduct,
} from "@/test/fixtures";
import { CatalogCheck } from "@/types/catalog";
import { UIProvider } from "@/ui";

// 화면 코드는 apis/를 직접 가져오지 않으므로(레이어 규칙) 모듈 경로로만 모킹한다
const api = vi.hoisted(() => ({
  fetchCatalogCheck: vi.fn(),
  syncResults: vi.fn(),
  updateMarkets: vi.fn(),
  deleteMarkets: vi.fn(),
  fetchAllProducts: vi.fn(),
  updateProduct: vi.fn(),
}));
vi.mock("@/apis/catalog", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchCatalogCheck: () => api.fetchCatalogCheck(),
}));
vi.mock("@/apis/result", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  syncResults: () => api.syncResults(),
}));
vi.mock("@/apis/market", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  updateMarkets: (body: unknown) => api.updateMarkets(body),
  deleteMarkets: (body: unknown) => api.deleteMarkets(body),
}));
vi.mock("@/apis/product", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  fetchAllProducts: () => api.fetchAllProducts(),
  updateProduct: (body: unknown) => api.updateProduct(body),
}));

// 판자 ← 나무 의자 ← 식탁. 나무 의자의 원목 시세가 없어 식탁까지 계산할 수 없다
const plank = createProduct({ id: 1, name: "판자", materials: [] });
const chair = createProduct({
  id: 2,
  name: "나무 의자",
  materials: [
    { name: "원목", basic: true, count: 2 },
    { name: "판자", basic: false, count: 1 },
  ],
});
const table = createProduct({
  id: 3,
  name: "식탁",
  materials: [{ name: "나무 의자", basic: false, count: 1 }],
});

const missingPrice = createProblem({
  productId: 2,
  productName: "나무 의자",
  message: "시세 정보가 없는 재료가 있습니다. (나무 의자: 원목)",
});
const blocked = createProblem({
  code: "BLOCKED_BY_SUB_PRODUCT",
  productId: 3,
  productName: "식탁",
  material: null,
  related: ["나무 의자"],
  hint: "먼저 하위 물품을 고치세요.",
  message: "하위 물품에 문제가 있어 계산할 수 없습니다. (식탁 ← 나무 의자)",
});
const missingResult = createProblem({
  code: "MISSING_RESULT",
  severity: "warning",
  productId: 1,
  productName: "판자",
  material: null,
  hint: "'결과 다시 맞추기'를 누르세요.",
  message: "결과가 없습니다. (판자)",
});
const unusedMarket = createProblem({
  code: "UNUSED_MARKET",
  severity: "info",
  productId: null,
  productName: null,
  material: "금",
  marketId: 4,
  hint: "필요 없으면 삭제하세요.",
  message: "어떤 물품도 쓰지 않는 시세입니다. (금)",
});

const checkWith = (problems = [missingPrice, blocked, missingResult]) =>
  createCatalogCheck({
    products: [
      { id: 1, name: "판자", status: "missing", resultId: null },
      { id: 2, name: "나무 의자", status: "error", resultId: null },
      { id: 3, name: "식탁", status: "error", resultId: null },
    ],
    markets: [{ id: 4, name: "금", price: 1000, usedBy: [] }],
    problems: [...problems, unusedMarket],
  });

function renderPage(check: CatalogCheck = checkWith()) {
  api.fetchCatalogCheck.mockResolvedValue(check);
  return render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
    >
      <UIProvider>
        <CatalogCheckPage />
      </UIProvider>
    </QueryClientProvider>
  );
}

// 설명 칸의 문구로 문제 행을 찾는다
const problemRow = async (message: string) => {
  await screen.findByText(message);
  const row = screen
    .getAllByRole("row")
    .find((element) => within(element).queryByText(message));
  if (!row) throw new Error(`${message} 행이 없습니다`);
  return row;
};

beforeEach(() => {
  api.fetchAllProducts.mockResolvedValue([plank, chair, table]);
  api.syncResults.mockResolvedValue([]);
  api.updateMarkets.mockResolvedValue([]);
  api.deleteMarkets.mockResolvedValue({ deletedIds: [] });
  api.updateProduct.mockImplementation(async (body: unknown) => body);
});

describe("CatalogCheckPage", () => {
  it("서버가 센 요약과 문제 목록을 보여 준다", async () => {
    renderPage();

    expect(
      await screen.findByText(
        "물품 3 · 결과 0 · 시세 1 · 오류 2 · 확인 필요 1 · 참고 1"
      )
    ).toBeInTheDocument();
    for (const message of [
      missingPrice.message,
      blocked.message,
      missingResult.message,
      unusedMarket.message,
    ]) {
      expect(screen.getByText(message)).toBeInTheDocument();
    }
  });

  it("결과 다시 맞추기는 결과 동기화를 부르고, 새로 만든 건수를 알린 뒤 점검을 다시 받는다", async () => {
    api.syncResults.mockResolvedValue([{ id: 7 }]);
    renderPage();
    const button = await screen.findByRole("button", {
      name: "결과 다시 맞추기",
    });

    fireEvent.click(button);

    expect(
      await screen.findByText("결과 1건을 새로 만들었습니다.")
    ).toBeInTheDocument();
    expect(api.syncResults).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(api.fetchCatalogCheck).toHaveBeenCalledTimes(2));

    api.syncResults.mockResolvedValue([]);
    fireEvent.click(button);
    expect(
      await screen.findByText(
        "새로 만들 결과는 없고, 기존 결과를 최신 값으로 맞췄습니다."
      )
    ).toBeInTheDocument();
  });

  it("결과 없음·결과 낡음이 없으면 결과 다시 맞추기를 누를 수 없다", async () => {
    renderPage(checkWith([missingPrice, blocked]));

    expect(
      await screen.findByRole("button", { name: "결과 다시 맞추기" })
    ).toBeDisabled();
  });

  it("시세 없는 재료는 그 자리에서 시세를 추가한다(id 없는 새 시세)", async () => {
    renderPage();
    const row = await problemRow(missingPrice.message);

    fireEvent.click(within(row).getByRole("button", { name: "시세 추가" }));
    const dialog = await screen.findByRole("dialog", { name: "시세 추가" });
    expect(within(dialog).getByLabelText("원목 이름")).toHaveValue("원목");
    expect(dialog).toHaveTextContent("쓰는 물품: 나무 의자");
    fireEvent.change(within(dialog).getByLabelText("원목 시세"), {
      target: { value: "700" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "추가" }));

    expect(
      await screen.findByText("시세를 추가했습니다. 결과도 다시 계산했습니다.")
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledWith([
      { name: "원목", price: 700 },
    ]);
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "시세 추가" })
      ).not.toBeInTheDocument()
    );
  });

  it("시세 추가가 실패하면 알림창을 띄우고 시세 추가 창을 유지한다", async () => {
    api.updateMarkets.mockRejectedValue(
      new MyHomeError({ message: "이미 존재하는 시세 이름입니다." })
    );
    renderPage();
    const row = await problemRow(missingPrice.message);

    fireEvent.click(within(row).getByRole("button", { name: "시세 추가" }));
    fireEvent.change(await screen.findByLabelText("원목 시세"), {
      target: { value: "700" },
    });
    fireEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(
      await screen.findByRole("dialog", { name: "시세를 추가하지 못했습니다" })
    ).toHaveTextContent("이미 존재하는 시세 이름입니다.");
    expect(
      screen.getByRole("dialog", { name: "시세 추가" })
    ).toBeInTheDocument();
  });

  it("쓰지 않는 시세는 확인 뒤 삭제한다", async () => {
    renderPage();
    const row = await problemRow(unusedMarket.message);

    fireEvent.click(within(row).getByRole("button", { name: "시세 삭제" }));
    const dialog = await screen.findByRole("dialog", {
      name: "'금' 시세를 삭제하시겠습니까?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "삭제" }));

    expect(await screen.findByText("삭제되었습니다.")).toBeInTheDocument();
    expect(api.deleteMarkets).toHaveBeenCalledWith({ ids: [4] });
  });

  it("물품 수정은 그 물품의 모달을 열고, 새 재료 시세를 먼저 추가한 뒤 물품을 저장한다", async () => {
    renderPage();
    const row = await problemRow(missingPrice.message);
    const edit = within(row).getByRole("button", { name: "물품 수정" });
    await waitFor(() => expect(edit).toBeEnabled());

    fireEvent.click(edit);
    const dialog = await screen.findByRole("dialog", {
      name: "나무 의자 정보 수정",
    });
    // 원목은 시세에 없으므로 새 시세를 받아야 저장할 수 있다
    fireEvent.change(within(dialog).getByLabelText("새 시세: 원목"), {
      target: { value: "300" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));

    expect(
      await screen.findByText(
        "새 시세 1개와 함께 수정했습니다. 이 물품을 재료로 쓰는 물품의 결과도 다시 계산했습니다."
      )
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledWith([
      { name: "원목", price: 300 },
    ]);
    expect(api.updateProduct).toHaveBeenCalledWith(chair);
    expect(api.updateMarkets.mock.invocationCallOrder[0]).toBeLessThan(
      api.updateProduct.mock.invocationCallOrder[0]
    );
  });

  it("새 시세를 만든 뒤 물품 저장이 실패해 그 시세를 지웠다면, 같은 재료로 다시 저장할 때 시세를 다시 만든다", async () => {
    // 서버 흉내: 시세 추가·삭제를 기억하고, 점검과 물품 저장이 그 상태를 따른다
    const silver = { id: 6, name: "은", price: 100, usedBy: [] };
    const unusedSilver = createProblem({
      ...unusedMarket,
      material: "은",
      marketId: 6,
      message: "어떤 물품도 쓰지 않는 시세입니다. (은)",
    });
    let hasSilver = false;
    api.fetchCatalogCheck.mockImplementation(async () => {
      const check = checkWith();
      return hasSilver
        ? {
            ...check,
            markets: [...check.markets, silver],
            problems: [...check.problems, unusedSilver],
          }
        : check;
    });
    api.updateMarkets.mockImplementation(async () => {
      hasSilver = true;
      return [];
    });
    api.deleteMarkets.mockImplementation(async () => {
      hasSilver = false;
      return { deletedIds: [6] };
    });
    // 첫 저장은 다른 이유로 실패하고, 그 뒤로는 서버처럼 시세가 없으면 거절한다
    api.updateProduct
      .mockRejectedValueOnce(
        new MyHomeError({
          message: "합계 금액이 너무 커서 저장할 수 없습니다. (나무 의자)",
        })
      )
      .mockImplementation(async (body: unknown) => {
        if (!hasSilver) {
          throw new MyHomeError({
            message: "시세 정보가 없는 재료가 있습니다. (나무 의자: 은)",
          });
        }
        return body;
      });
    render(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: 0 } } })}
      >
        <UIProvider>
          <CatalogCheckPage />
        </UIProvider>
      </QueryClientProvider>
    );

    // 나무 의자의 원목을 새 최하위재료 '은'으로 바꿔 저장한다
    const editChairWithSilver = async () => {
      const row = await problemRow(missingPrice.message);
      const edit = within(row).getByRole("button", { name: "물품 수정" });
      await waitFor(() => expect(edit).toBeEnabled());
      fireEvent.click(edit);
      const dialog = await screen.findByRole("dialog", {
        name: "나무 의자 정보 수정",
      });
      fireEvent.change(within(dialog).getAllByLabelText("물품명")[1], {
        target: { value: "은" },
      });
      fireEvent.change(await within(dialog).findByLabelText("새 시세: 은"), {
        target: { value: "100" },
      });
      fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));
      return dialog;
    };

    // 1) 은 시세는 만들어지고 물품 저장은 실패한다. 알림창을 닫고 모달도 취소한다
    const first = await editChairWithSilver();
    const alert = await screen.findByRole("dialog", {
      name: "저장하지 못했습니다",
    });
    fireEvent.click(within(alert).getByRole("button", { name: "확인" }));
    fireEvent.click(within(first).getByRole("button", { name: "취소" }));
    expect(api.updateMarkets).toHaveBeenCalledTimes(1);

    // 2) 남은 은은 쓰지 않는 시세로 보이고, 같은 화면에서 지운다
    const unusedRow = await problemRow(unusedSilver.message);
    fireEvent.click(
      within(unusedRow).getByRole("button", { name: "시세 삭제" })
    );
    fireEvent.click(
      within(
        await screen.findByRole("dialog", {
          name: "'은' 시세를 삭제하시겠습니까?",
        })
      ).getByRole("button", { name: "삭제" })
    );
    await waitFor(() =>
      expect(screen.queryByText(unusedSilver.message)).not.toBeInTheDocument()
    );

    // 3) 같은 재료로 다시 고치면 지운 시세를 다시 만든 뒤 물품을 저장한다
    await editChairWithSilver();
    expect(
      await screen.findByText(
        "새 시세 1개와 함께 수정했습니다. 이 물품을 재료로 쓰는 물품의 결과도 다시 계산했습니다."
      )
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledTimes(2);
    expect(api.updateMarkets).toHaveBeenLastCalledWith([
      { name: "은", price: 100 },
    ]);
  });

  it("새 시세 추가가 실패하면 점검을 다시 받아, 그사이 생긴 시세로 다시 저장할 수 있다", async () => {
    // 다른 탭에서 원목 시세를 먼저 추가했지만 이 화면의 점검 정보는 아직 낡았다
    let hasWood = false;
    api.updateMarkets.mockImplementation(async () => {
      hasWood = true;
      throw new MyHomeError({ message: "이미 존재하는 시세 이름입니다." });
    });
    renderPage();
    // 처음 받은 뒤로는 서버 흉내를 따른다
    api.fetchCatalogCheck.mockImplementation(async () => {
      const check = checkWith(
        hasWood
          ? [blocked, missingResult]
          : [missingPrice, blocked, missingResult]
      );
      return hasWood
        ? {
            ...check,
            markets: [
              ...check.markets,
              { id: 5, name: "원목", price: 300, usedBy: ["나무 의자"] },
            ],
          }
        : check;
    });
    const row = await problemRow(missingPrice.message);
    const edit = within(row).getByRole("button", { name: "물품 수정" });
    await waitFor(() => expect(edit).toBeEnabled());
    fireEvent.click(edit);
    const dialog = await screen.findByRole("dialog", {
      name: "나무 의자 정보 수정",
    });
    fireEvent.change(within(dialog).getByLabelText("새 시세: 원목"), {
      target: { value: "300" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));

    const alert = await screen.findByRole("dialog", {
      name: "저장하지 못했습니다",
    });
    expect(alert).toHaveTextContent("이미 존재하는 시세 이름입니다.");
    fireEvent.click(within(alert).getByRole("button", { name: "확인" }));

    // 다시 받은 점검에는 원목 시세가 있으므로 새 시세를 받지 않고 물품만 저장한다
    await waitFor(() =>
      expect(
        within(dialog).queryByLabelText("새 시세: 원목")
      ).not.toBeInTheDocument()
    );
    fireEvent.click(within(dialog).getByRole("button", { name: "수정" }));
    expect(
      await screen.findByText(
        "수정했습니다. 이 물품을 재료로 쓰는 물품의 결과도 다시 계산했습니다."
      )
    ).toBeInTheDocument();
    expect(api.updateMarkets).toHaveBeenCalledTimes(1);
    expect(api.updateProduct).toHaveBeenCalledWith(chair);
  });

  it("하위 물품 때문에 계산할 수 없는 물품은 원인 물품의 모달을 연다", async () => {
    renderPage();
    const row = await problemRow(blocked.message);
    const edit = within(row).getByRole("button", { name: "원인 물품 수정" });
    await waitFor(() => expect(edit).toBeEnabled());

    fireEvent.click(edit);

    expect(
      await screen.findByRole("dialog", { name: "나무 의자 정보 수정" })
    ).toBeInTheDocument();
  });

  it("문제가 없으면 빈 상태 안내를 보여 준다", async () => {
    renderPage(createCatalogCheck());

    expect(
      await screen.findByText("문제가 없습니다. 모든 물품의 결과가 최신입니다.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "결과 다시 맞추기" })
    ).toBeDisabled();
  });

  it("점검을 불러오지 못하면 오류와 다시 시도 버튼을 보여 준다", async () => {
    api.fetchCatalogCheck.mockRejectedValueOnce(
      new MyHomeError({ message: "서버에 연결할 수 없습니다." })
    );
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "데이터 점검 정보를 불러오지 못했습니다.서버에 연결할 수 없습니다."
    );

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(
      await screen.findByText(
        "물품 3 · 결과 0 · 시세 1 · 오류 2 · 확인 필요 1 · 참고 1"
      )
    ).toBeInTheDocument();
  });
});
