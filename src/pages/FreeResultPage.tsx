import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { CartButton } from "@/components/cart/CartButton";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { Panel } from "@/components/common/Panel";
import { SearchBar } from "@/components/common/SearchBar";
import { ResultTable } from "@/components/result/ResultTable";
import { parseMarketList } from "@/domain/market";
import { parseResultList } from "@/domain/result";
import { readJSON, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { useOwnedCounts } from "@/pages/useOwnedCounts";
import { useCalculateResultsQuery } from "@/queries/result";
import { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Result } from "@/types/result";
import { Button, Stack, Text, Title, useToast } from "@/ui";

export function FreeResultPage() {
  const toast = useToast();
  const addToCart = useAddToCart("free");
  const owned = useOwnedCounts();

  // 시세 입력 화면이 넘긴 시세. 주소로 직접 들어왔거나 형식이 맞지 않으면 입력 화면으로 돌려보낸다.
  const { state }: { state: unknown } = useLocation();
  const markets = parseMarketList(
    typeof state === "object" && state !== null && "markets" in state
      ? state.markets
      : undefined
  );

  const { isLoading, isError, error, data } = useCalculateResultsQuery(
    { markets: markets ?? [] },
    { enabled: !!markets }
  );

  // 브라우저에 저장해 둔 결과. 기본은 새로 계산한 결과를 보여 주고, 저장본은 명시적으로 연다.
  const [saved, setSaved] = useState<Result[] | undefined>(() =>
    parseResultList(readJSON(STORAGE_KEY.RESULT))
  );
  const [showSaved, setShowSaved] = useState(false);

  const [query, setQuery] = useState("");

  const list = (showSaved ? saved : data) ?? [];
  const filtered = query ? list.filter((r) => r.name.includes(query)) : list;

  const onSave = () => {
    if (!data) return;
    if (!writeJSON(STORAGE_KEY.RESULT, data)) {
      toast.error(
        "브라우저에 저장하지 못했습니다. 저장 공간이나 사이트 데이터 설정을 확인해주세요."
      );
      return;
    }
    setSaved(data);
    toast.success("현재 결과를 브라우저에 저장했습니다.");
  };

  if (!markets) return <Navigate to={ROUTES.FREE} replace />;

  return (
    <Stack vertical>
      <Stack justify='space-between' wrap>
        <Title level={5} style={{ margin: 0 }}>
          {showSaved ? "저장된 결과" : "입력한 시세로 계산한 결과"}
        </Title>
        <Stack wrap>
          <CartButton />
          {showSaved ? (
            <Button onClick={() => setShowSaved(false)}>
              새 계산 결과 보기
            </Button>
          ) : (
            <Button onClick={() => setShowSaved(true)} disabled={!saved}>
              저장된 결과 불러오기
            </Button>
          )}
          <Button
            variant='primary'
            onClick={onSave}
            disabled={showSaved || !data}
          >
            로컬에 저장하기
          </Button>
        </Stack>
      </Stack>
      <Text tone='secondary'>
        이 결과는 서버에 저장되지 않으며 현재 접속 중인 브라우저에 저장할 수
        있습니다.
      </Text>
      <Panel>
        <SearchBar onSearch={setQuery} />
      </Panel>
      {isError && !showSaved ? (
        <Text tone='danger'>
          결과를 계산할 수 없습니다. {getErrorMessage(error)}
        </Text>
      ) : (
        <ResultTable
          loading={isLoading && !showSaved}
          contents={filtered}
          onRowClick={addToCart}
          owned={owned}
        />
      )}
    </Stack>
  );
}
