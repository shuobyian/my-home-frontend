import { getErrorMessage } from "@/apis/errors";
import { NewMarketsModal } from "@/components/market/NewMarketsModal";
import { BulkUploadPanel } from "@/components/product/BulkUploadPanel";
import { ExcelButton } from "@/components/product/ExcelButton";
import { ProductNameList } from "@/components/product/ProductNameList";
import { ProductTableView } from "@/components/product/ProductTableView";
import {
  CatalogNames,
  findUploadProblems,
  parseNameList,
  UploadProblems,
  uploadMessagesByProduct,
} from "@/domain/catalog";
import {
  BulkUploadPlan,
  nextProductId,
  normalizeProductIds,
  parseSavedProducts,
  planBulkUpload,
  toDraftProducts,
} from "@/domain/productExcel";
import { formatNumber } from "@/lib/format";
import { readJSON, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { useMarketsQuery, useUpdateMarketsMutation } from "@/queries/market";
import {
  useAllProductsQuery,
  useCreateProductsMutation,
} from "@/queries/product";
import { useEffect, useMemo, useState } from "react";
import { Market, NewMarket } from "@/types/market";
import { Product } from "@/types/product";
import {
  Button,
  Paragraph,
  Stack,
  Text,
  Title,
  useDialogs,
  useToast,
} from "@/ui";

const nameOf = ({ name }: Pick<Product, "name">) => name.trim();

// 이름 목록에 새 이름을 더하고 중복을 없앤다. 더할 것도 없앨 중복도 없으면 같은 배열을 돌려준다(저장·렌더를 줄인다).
// 이전에 기록된 목록에는 중복이 있을 수 있으므로, 크기만으로는 더한 이름이 없다고 판단하지 않는다
function withNames(known: string[], names: Iterable<string>) {
  const next = new Set(known);
  const unique = next.size === known.length;
  for (const name of names) next.add(name);
  return unique && next.size === known.length ? known : [...next];
}

// 서버 목록과 비교한 업로드 계획과, 올릴 물품의 재료 참조 문제.
// 같은 업로드 안의 물품은 서로를 하위재료로 쓸 수 있으므로 올릴 이름도 물품 이름에 넣는다
function planUpload(
  draft: readonly Product[],
  serverProducts: readonly Product[],
  markets: readonly Market[],
  knownNames: readonly string[]
): { plan: BulkUploadPlan; problems: UploadProblems } {
  const plan = planBulkUpload(draft, serverProducts, knownNames);
  const problems = findUploadProblems(plan.toAdd, {
    markets: new Set(markets.map(({ name }) => name)),
    products: new Set([
      ...serverProducts.map(nameOf),
      ...plan.toAdd.map(nameOf),
    ]),
  });
  return { plan, problems };
}

const isBlocked = ({
  missingMarkets,
  rowProblems,
  duplicates,
}: UploadProblems) =>
  missingMarkets.length + rowProblems.length + duplicates.length > 0;

// Raw 표의 상태 칸
type RowStatus = {
  label: string;
  tone?: "warning" | "secondary";
  messages?: string[];
};

// 엑셀로 가져온 물품을 브라우저에서 편집하고(작업 초안), 서버에 없는 새 물품만 일괄 저장한다
export function ManageHomePage() {
  const toast = useToast();
  const dialogs = useDialogs();
  // 실패해도 초안 편집은 계속할 수 있도록 화면에서 오류를 보여 준다
  const productsQuery = useAllProductsQuery();
  const marketsQuery = useMarketsQuery({ throwOnError: false });
  const upload = useCreateProductsMutation();
  const updateMarkets = useUpdateMarketsMutation();

  // 작업 초안. 마운트할 때 한 번 읽고(모듈 최상단에서 읽으면 앱 시작 시점 값에 고정된다),
  // 바뀔 때마다 저장해 서버에 올리지 않은 편집도 새로고침 뒤에 남게 한다
  const [products, setProducts] = useState<Product[]>(() =>
    parseSavedProducts(readJSON(STORAGE_KEY.PRODUCT))
  );
  useEffect(() => {
    writeJSON(STORAGE_KEY.PRODUCT, products);
  }, [products]);

  // 서버에 올렸거나 서버 목록에서 본 물품 이름. 서버에 없는 이름이 새 물품인지, 서버에서 지워진 물품인지 가른다.
  // 처음 실행이면 마운트 시점 초안 이름으로 시작한다(이전에는 my-home-product가 마지막으로 올린 목록이었다)
  const [knownNames, setKnownNames] = useState<string[]>(
    () =>
      parseNameList(readJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES)) ?? [
        ...new Set(products.map(nameOf)),
      ]
  );
  useEffect(() => {
    writeJSON(STORAGE_KEY.PRODUCT_KNOWN_NAMES, knownNames);
  }, [knownNames]);

  // 서버 목록을 새로 받을 때마다 그 이름을 더한다
  const serverProducts = productsQuery.data;
  const markets = marketsQuery.data;
  const [seenServerProducts, setSeenServerProducts] = useState<Product[]>();
  if (serverProducts && serverProducts !== seenServerProducts) {
    setSeenServerProducts(serverProducts);
    setKnownNames((prev) => withNames(prev, serverProducts.map(nameOf)));
  }

  const prepared = useMemo(
    () =>
      serverProducts &&
      markets &&
      planUpload(products, serverProducts, markets, knownNames),
    [products, serverProducts, markets, knownNames]
  );
  const plan = prepared?.plan;
  const problems = prepared?.problems;
  const loadFailed = productsQuery.isError || marketsQuery.isError;
  const canSave =
    !!plan &&
    !!problems &&
    !loadFailed &&
    plan.toAdd.length > 0 &&
    !isBlocked(problems);

  // 모달의 재료 이름 비교 기준: 서버 시세와, 서버 물품 ∪ 초안 물품
  const catalogNames = useMemo<CatalogNames | undefined>(
    () =>
      serverProducts &&
      markets && {
        markets: new Set(markets.map(({ name }) => name)),
        products: new Set([
          ...serverProducts.map(nameOf),
          ...products.map(nameOf),
        ]),
      },
    [serverProducts, markets, products]
  );

  // 이름별 상태(새 물품 / 서버에 있음 / 서버와 다름 / 서버에서 삭제됨)
  const statusByName = useMemo(() => {
    const statuses = new Map<string, RowStatus>();
    if (!plan) return statuses;
    const messages = problems
      ? uploadMessagesByProduct(problems)
      : new Map<string, string[]>();
    plan.toAdd.forEach((product) => {
      const rowMessages = messages.get(nameOf(product));
      statuses.set(
        nameOf(product),
        rowMessages
          ? {
              label: "새 물품 · 확인 필요",
              tone: "warning",
              messages: rowMessages,
            }
          : { label: "새 물품" }
      );
    });
    plan.differs.forEach((product) =>
      statuses.set(nameOf(product), { label: "서버와 다름", tone: "warning" })
    );
    plan.revived.forEach((product) =>
      statuses.set(nameOf(product), {
        label: "서버에서 삭제됨",
        tone: "warning",
      })
    );
    return statuses;
  }, [plan, problems]);

  const renderStatus = (product: Product) => {
    if (!plan) return "-";
    const status = statusByName.get(nameOf(product)) ?? {
      label: "서버에 있음",
      tone: "secondary",
    };
    return (
      <Text tone={status.tone} title={status.messages?.join("\n")}>
        {status.label}
      </Text>
    );
  };

  // 시세 추가 모달에 미리 채울 재료 이름
  const [newMarketNames, setNewMarketNames] = useState<string[] | null>(null);
  const [preparing, setPreparing] = useState(false);

  const importProducts = (imported: Product[]) => {
    setProducts(normalizeProductIds(imported));
  };

  const addMarkets = async (newMarkets: NewMarket[]) => {
    try {
      await updateMarkets.mutateAsync(newMarkets);
      toast.success(
        `시세 ${formatNumber(newMarkets.length)}개를 추가했습니다.`
      );
    } catch (error) {
      dialogs.alert({
        status: "error",
        title: "시세를 추가하지 못했습니다",
        content: getErrorMessage(error),
      });
      // 모달이 입력을 유지한 채 열려 있게 한다
      throw error;
    }
  };

  const save = async (toAdd: Product[]) => {
    try {
      const saved = await upload.mutateAsync({
        // 서버는 id를 무시하므로 보내지 않는다
        products: toAdd.map(({ id, ...product }) => product),
      });
      const savedNames = new Set(saved.map(nameOf));
      // 확인한 뒤에 다른 곳에서 같은 이름이 추가되면 서버가 건너뛴다
      const skipped = toAdd.filter(
        (product) => !savedNames.has(nameOf(product))
      );
      setKnownNames((prev) => withNames(prev, savedNames));
      dialogs.alert({
        title: `${formatNumber(saved.length)}개 물품을 추가하고 결과도 만들었습니다.`,
        content: (
          <Stack vertical>
            <ProductNameList products={saved} />
            {skipped.length > 0 && (
              <>
                <Text tone='warning'>
                  이미 서버에 있어 건너뜀 {formatNumber(skipped.length)}개
                </Text>
                <ProductNameList products={skipped} />
              </>
            )}
          </Stack>
        ),
        okText: "확인",
      });
    } catch (error) {
      // 올린 이름을 기억하지 않으므로 고친 뒤 다시 시도할 수 있다
      dialogs.alert({
        status: "error",
        title: "저장하지 못했습니다",
        content: getErrorMessage(error),
      });
    }
  };

  const confirmSave = async () => {
    // 그사이 다른 화면에서 바뀐 서버 물품·시세로 다시 계산한다
    setPreparing(true);
    const [latestProducts, latestMarkets] = await Promise.all([
      productsQuery.refetch(),
      marketsQuery.refetch(),
    ]).finally(() => setPreparing(false));
    if (
      latestProducts.isError ||
      latestMarkets.isError ||
      !latestProducts.data ||
      !latestMarkets.data
    ) {
      dialogs.alert({
        status: "error",
        title: "서버 목록을 불러오지 못했습니다",
        content: getErrorMessage(latestProducts.error ?? latestMarkets.error),
      });
      return;
    }
    const latest = planUpload(
      products,
      latestProducts.data,
      latestMarkets.data,
      withNames(knownNames, latestProducts.data.map(nameOf))
    );
    if (latest.plan.toAdd.length === 0 || isBlocked(latest.problems)) {
      toast.error(
        "최신 서버 목록과 비교하니 올릴 수 없습니다. 위 안내를 확인해주세요."
      );
      return;
    }

    const { toAdd } = latest.plan;
    dialogs.confirm({
      title: "서버에 저장하시겠습니까?",
      width: 520,
      content: (
        <Stack vertical>
          <Text>
            추가할 물품 {formatNumber(toAdd.length)}개를 서버에 올리고 결과도
            만듭니다.
          </Text>
          <ProductNameList products={toAdd} />
        </Stack>
      ),
      onOk: () => save(toAdd),
      okText: "저장",
      cancelText: "취소",
    });
  };

  const confirmLoadServer = () => {
    if (!serverProducts) return;
    dialogs.confirm({
      title: "서버 목록을 불러오시겠습니까?",
      content: `Raw 목록을 서버 물품 ${formatNumber(serverProducts.length)}개로 바꿉니다. 올리지 않은 Raw 변경은 사라집니다.`,
      okText: "불러오기",
      cancelText: "취소",
      onOk: () => {
        setProducts(toDraftProducts(serverProducts));
        setKnownNames((prev) => withNames(prev, serverProducts.map(nameOf)));
        toast.success(
          `서버 물품 ${formatNumber(serverProducts.length)}개를 불러왔습니다.`
        );
      },
    });
  };

  const confirmDropRevived = () => {
    if (!plan) return;
    const { revived } = plan;
    dialogs.confirm({
      title: `${formatNumber(revived.length)}개 물품을 Raw 목록에서 빼시겠습니까?`,
      content: <ProductNameList products={revived} />,
      okText: "빼기",
      cancelText: "취소",
      onOk: () => {
        const names = new Set(revived.map(nameOf));
        setProducts((prev) =>
          prev.filter((product) => !names.has(nameOf(product)))
        );
      },
    });
  };

  return (
    <>
      <Stack vertical style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Raw 엑셀 데이터
        </Title>
        <Paragraph tone='secondary' style={{ margin: 0 }}>
          엑셀로 가져온 물품을 편집하는 작업 공간입니다. 편집 내용은 이
          브라우저에 바로 저장되고, '저장'은 서버에 없는 새 물품만 올립니다.
          기존 물품의 수정·삭제는 '물품 리스트'에서 해주세요.
        </Paragraph>
        <BulkUploadPanel
          plan={plan}
          problems={problems}
          loading={productsQuery.isPending || marketsQuery.isPending}
          error={loadFailed}
          onAddMarkets={setNewMarketNames}
          onDropRevived={confirmDropRevived}
        />
      </Stack>
      <ProductTableView
        products={products}
        total={products.length}
        catalogNames={catalogNames}
        requireNewMarketPrices={false}
        renderStatus={renderStatus}
        onAdd={async (product) => {
          setProducts((prev) => [
            { ...product, id: nextProductId(prev) },
            ...prev,
          ]);
          toast.success("추가되었습니다");
        }}
        onEdit={async (product) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? product : p))
          );
          toast.success("수정되었습니다");
        }}
        onRemove={async (targets) => {
          const ids = new Set(targets.map(({ id }) => id));
          setProducts((prev) => prev.filter(({ id }) => !ids.has(id)));
          toast.success("삭제되었습니다");
        }}
        toolbarExtra={
          <Stack>
            <Button onClick={confirmLoadServer} disabled={!serverProducts}>
              서버 목록 불러오기
            </Button>
            <Button
              onClick={() => void confirmSave()}
              variant='primary'
              loading={preparing}
              disabled={!canSave}
            >
              저장
            </Button>
          </Stack>
        }
      />
      <hr />
      <ExcelButton products={products} onImport={importProducts} />
      {newMarketNames && (
        <NewMarketsModal
          names={newMarketNames}
          usedBy={Object.fromEntries(
            (problems?.missingMarkets ?? []).map(({ name, usedBy }) => [
              name,
              usedBy,
            ])
          )}
          existingNames={catalogNames?.markets ?? new Set()}
          onSubmit={addMarkets}
          onClose={() => setNewMarketNames(null)}
        />
      )}
    </>
  );
}
