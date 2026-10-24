import { getErrorMessage } from "@/apis/errors";
import { ProblemTable } from "@/components/catalog/ProblemTable";
import { NewMarketsModal } from "@/components/market/NewMarketsModal";
import { ProductModal } from "@/components/product/ProductModal";
import { toCatalogNames } from "@/domain/catalog";
import { formatNumber } from "@/lib/format";
import { useSaveProduct } from "@/pages/manage/useSaveProduct";
import { useCatalogCheckQuery } from "@/queries/catalog";
import {
  useDeleteMarketsMutation,
  useUpdateMarketsMutation,
} from "@/queries/market";
import { useAllProductsQuery } from "@/queries/product";
import { useSyncResultsMutation } from "@/queries/result";
import { useMemo, useState } from "react";
import { CatalogProblem } from "@/types/catalog";
import { NewMarket } from "@/types/market";
import { Product } from "@/types/product";
import {
  Alert,
  Button,
  Empty,
  Paragraph,
  Spin,
  Stack,
  Text,
  Title,
  useDialogs,
  useToast,
} from "@/ui";

// 결과 다시 맞추기로 고칠 수 있는 문제
const RESYNC_CODES: readonly CatalogProblem["code"][] = [
  "MISSING_RESULT",
  "STALE_RESULT",
];

// 서버의 데이터 점검 결과를 보여 주고, 문제마다 그 자리에서 고칠 수 있게 한다
export function CatalogCheckPage() {
  const toast = useToast();
  const dialogs = useDialogs();

  const checkQuery = useCatalogCheckQuery();
  const { data: check } = checkQuery;
  // 물품 수정 모달에 넣을 물품(점검 응답에는 레시피가 없다)
  const productsQuery = useAllProductsQuery();
  const syncResults = useSyncResultsMutation();
  const updateMarkets = useUpdateMarketsMutation();
  const deleteMarkets = useDeleteMarketsMutation();

  const catalogNames = useMemo(() => check && toCatalogNames(check), [check]);
  const saveProduct = useSaveProduct(catalogNames?.markets);
  const [editing, setEditing] = useState<Product | null>(null);
  // 시세 추가 모달에 미리 채울 재료 이름
  const [newMarketName, setNewMarketName] = useState<string | null>(null);

  const findProduct = (match: (product: Product) => boolean) =>
    productsQuery.data?.find(match);

  const resync = async () => {
    try {
      const created = await syncResults.mutateAsync();
      toast.success(
        created.length > 0
          ? `결과 ${formatNumber(created.length)}건을 새로 만들었습니다.`
          : "새로 만들 결과는 없고, 기존 결과를 최신 값으로 맞췄습니다."
      );
    } catch (error) {
      dialogs.alert({
        status: "error",
        title: "결과를 맞추지 못했습니다",
        content: getErrorMessage(error),
      });
    }
  };

  const addMarkets = async (markets: NewMarket[]) => {
    try {
      await updateMarkets.mutateAsync(markets);
      toast.success("시세를 추가했습니다. 결과도 다시 계산했습니다.");
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

  const confirmDeleteMarket = (marketId: number, name: string) => {
    dialogs.confirm({
      title: `'${name}' 시세를 삭제하시겠습니까?`,
      okText: "삭제",
      cancelText: "취소",
      onOk: async () => {
        try {
          await deleteMarkets.mutateAsync({ ids: [marketId] });
          toast.success("삭제되었습니다.");
        } catch (error) {
          dialogs.alert({
            status: "error",
            title: "삭제하지 못했습니다",
            content: getErrorMessage(error),
          });
        }
      },
    });
  };

  // 물품 목록을 아직 받지 못했거나 찾지 못하면 누를 수 없다
  const editButton = (label: string, product: Product | undefined) => (
    <Button
      disabled={!product}
      onClick={() => {
        if (product) setEditing(product);
      }}
    >
      {label}
    </Button>
  );

  const renderActions = ({
    code,
    productId,
    material,
    marketId,
    related,
  }: CatalogProblem) => {
    const byId = () => findProduct(({ id }) => id === productId);
    switch (code) {
      case "MISSING_PRICE":
        return (
          <>
            <Button onClick={() => setNewMarketName(material)}>
              시세 추가
            </Button>
            {editButton("물품 수정", byId())}
          </>
        );
      case "UNKNOWN_SUB_PRODUCT":
      case "CIRCULAR_RECIPE":
      case "TOTAL_OVERFLOW":
      case "NAME_CONFLICT":
        return editButton("물품 수정", byId());
      // 이 물품은 그대로 두고, 계산을 막는 하위 물품을 고친다
      case "BLOCKED_BY_SUB_PRODUCT":
        return editButton(
          "원인 물품 수정",
          findProduct(({ name }) => name === related[0])
        );
      case "UNUSED_MARKET":
        return (
          marketId !== null &&
          material !== null && (
            <Button
              danger
              onClick={() => confirmDeleteMarket(marketId, material)}
            >
              시세 삭제
            </Button>
          )
        );
      default:
        return null;
    }
  };

  // 같은 재료가 시세에 없는 물품들(시세 추가 모달에 함께 보여 준다)
  const missingPriceUsers = (name: string) => [
    ...new Set(
      check?.problems
        .filter(
          ({ code, material, productName }) =>
            code === "MISSING_PRICE" && material === name && productName
        )
        .map(({ productName }) => productName as string)
    ),
  ];

  const renderContent = () => {
    if (checkQuery.isPending) return <Spin />;
    if (checkQuery.isError || !check) {
      return (
        <Stack vertical align='flex-start'>
          <Alert
            title='데이터 점검 정보를 불러오지 못했습니다.'
            description={getErrorMessage(checkQuery.error)}
            style={{ alignSelf: "stretch" }}
          />
          <Button onClick={() => void checkQuery.refetch()}>다시 시도</Button>
        </Stack>
      );
    }

    const { summary, problems } = check;
    return (
      <Stack vertical>
        <Stack justify='space-between' wrap>
          <Text strong>
            물품 {formatNumber(summary.products)} · 결과{" "}
            {formatNumber(summary.results)} · 시세{" "}
            {formatNumber(summary.markets)} · 오류{" "}
            {formatNumber(summary.errors)} · 확인 필요{" "}
            {formatNumber(summary.warnings)} · 참고{" "}
            {formatNumber(summary.infos)}
          </Text>
          <Button
            variant='primary'
            loading={syncResults.isPending}
            disabled={!problems.some(({ code }) => RESYNC_CODES.includes(code))}
            onClick={() => void resync()}
          >
            결과 다시 맞추기
          </Button>
        </Stack>
        {productsQuery.isError && (
          <Text tone='warning'>
            물품 목록을 불러오지 못해 물품 수정 버튼을 쓸 수 없습니다.
          </Text>
        )}
        {problems.length === 0 ? (
          <Empty description='문제가 없습니다. 모든 물품의 결과가 최신입니다.' />
        ) : (
          <ProblemTable problems={problems} renderActions={renderActions} />
        )}
      </Stack>
    );
  };

  return (
    <Stack vertical>
      <Title level={4} style={{ margin: 0 }}>
        데이터 점검
      </Title>
      <Paragraph tone='secondary' style={{ margin: 0 }}>
        시세·물품·결과가 서로 맞는지 서버가 점검한 결과입니다. 물품이나 시세를
        저장하면 결과는 자동으로 맞춰집니다. 아래 오류는 직접 고쳐야 합니다.
      </Paragraph>
      {renderContent()}
      {editing && (
        <ProductModal
          product={editing}
          catalogNames={catalogNames}
          requireNewMarketPrices
          onSubmit={(value, newMarkets) =>
            saveProduct.edit(value as Product, newMarkets)
          }
          onClose={() => setEditing(null)}
        />
      )}
      {newMarketName !== null && (
        <NewMarketsModal
          names={[newMarketName]}
          usedBy={{ [newMarketName]: missingPriceUsers(newMarketName) }}
          existingNames={catalogNames?.markets ?? new Set()}
          onSubmit={addMarkets}
          onClose={() => setNewMarketName(null)}
        />
      )}
    </Stack>
  );
}
