import { getErrorMessage } from "@/apis/errors";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { MarketEditor } from "@/components/market/MarketEditor";
import { MarketRowDiff } from "@/domain/market";
import { formatNumber } from "@/lib/format";
import { useCatalogCheckQuery } from "@/queries/catalog";
import {
  useDeleteMarketsMutation,
  useMarketsQuery,
  useUpdateMarketsMutation,
} from "@/queries/market";
import { useMemo, useState } from "react";
import { Market, MarketUpdateItem } from "@/types/market";
import { Paragraph, Stack, Text, Title, useDialogs, useToast } from "@/ui";

export function MarketManagePage() {
  const toast = useToast();
  const dialogs = useDialogs();

  // 캐시에 남은 오래된 시세로 채우면 저장 시 최신 시세를 덮어쓰므로 새로 받은 값만 쓴다
  const marketsQuery = useMarketsQuery();
  const markets = marketsQuery.isFetchedAfterMount
    ? marketsQuery.data
    : undefined;
  // 시세마다 쓰는 물품(사용처를 알아야 삭제·이름 변경 안내를 할 수 있다)
  const checkQuery = useCatalogCheckQuery();
  const { data: check } = checkQuery;
  const usage = useMemo(
    () => check && new Map(check.markets.map((m) => [m.name, m.usedBy])),
    [check]
  );
  const updateMarkets = useUpdateMarketsMutation();
  const deleteMarkets = useDeleteMarketsMutation();

  // 저장이 끝나면 편집기를 다시 마운트해 서버 값으로 채운다
  const [editorKey, setEditorKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const save = async (changes: MarketUpdateItem[]) => {
    setSaving(true);
    try {
      await updateMarkets.mutateAsync(changes);
      // 새 시세의 id와 서버가 다듬은 이름을 받은 뒤 다시 채운다
      await marketsQuery.refetch();
      setEditorKey((key) => key + 1);
      toast.success("저장했습니다. 결과도 다시 계산했습니다.");
    } catch (error) {
      dialogs.alert({
        status: "error",
        title: "저장하지 못했습니다",
        content: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  // 이름을 바꾸면 그 재료를 쓰는 물품 레시피도 바뀌므로 사용처가 있으면 확인을 받는다
  const submit = (
    changes: MarketUpdateItem[],
    renames: MarketRowDiff["renames"]
  ) => {
    const affected = renames.filter(
      ({ from }) => !usage || (usage.get(from)?.length ?? 0) > 0
    );
    if (affected.length === 0) {
      void save(changes);
      return;
    }
    dialogs.confirm({
      title: "이름을 바꾸시겠습니까?",
      width: 520,
      content: (
        <Stack vertical>
          {affected.map(({ from, to }) => {
            const products = usage?.get(from);
            return (
              <Text key={from}>
                {products
                  ? `'${from}' → '${to}': 이 재료를 쓰는 물품 ${formatNumber(products.length)}개(${products.join(", ")})의 레시피도 함께 바뀝니다.`
                  : `'${from}' → '${to}': 이 재료를 쓰는 물품 레시피도 함께 바뀝니다.`}
              </Text>
            );
          })}
        </Stack>
      ),
      okText: "저장",
      cancelText: "취소",
      onOk: () => save(changes),
    });
  };

  const confirmDelete = (market: Market) => {
    dialogs.confirm({
      title: `'${market.name}' 시세를 삭제하시겠습니까?`,
      okText: "삭제",
      cancelText: "취소",
      onOk: async () => {
        try {
          await deleteMarkets.mutateAsync({ ids: [market.id] });
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

  return (
    <div>
      <Title level={4}>시세 리스트</Title>
      <div style={{ marginBottom: 8 }}>
        <CatalogStatusBanner
          check={check}
          loading={checkQuery.isPending}
          error={checkQuery.isError}
        />
      </div>
      <Paragraph tone='secondary'>
        저장하면 모든 물품의 결과가 새 시세로 바로 다시 계산되고, 새 시세로
        계산할 수 있게 된 물품의 결과도 만들어집니다. 이름을 바꾸면 그 재료를
        쓰는 물품 레시피도 함께 바뀝니다. 쓰는 물품이 없는 시세만 삭제할 수
        있습니다.
      </Paragraph>
      <MarketEditor
        key={editorKey}
        markets={markets}
        usage={usage}
        submitting={saving}
        onSubmit={submit}
        onDelete={confirmDelete}
      />
    </div>
  );
}
