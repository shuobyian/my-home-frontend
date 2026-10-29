import { CartButton } from "@/components/cart/CartButton";
import { Guide } from "@/components/common/Guide";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { ResultSearchForm } from "@/components/result/ResultSearchForm";
import { ResultCards } from "@/components/result/ResultCards";
import {
  parseResultSearch,
  ResultSearchState,
  toResultSearchParams,
} from "@/domain/resultSearch";
import { useOwnedCounts } from "@/pages/useOwnedCounts";
import { useResultsQuery } from "@/queries/result";
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import { Stack, Text } from "@/ui";

// 홈: 결과 검색. 검색 조건은 URL에 두어 뒤로 가기·새로고침·공유 시에도 유지한다.
export function HomePage() {
  const addToCart = useAddToCart("server");
  const owned = useOwnedCounts();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const search = useMemo(
    () => parseResultSearch(new URLSearchParams(queryString)),
    [queryString]
  );

  // 쪽을 나누지 않고 검색 조건의 결과를 한 번에 모두 받는다
  const { data: results, isFetching } = useResultsQuery({
    name: search.name || undefined,
    tool: search.tool,
    category: search.category,
  });

  // 같은 주소로의 이동은 히스토리에 쌓지 않는다(링크 클릭과 같은 규칙)
  const navigateTo = (next: ResultSearchState) => {
    const params = toResultSearchParams(next);
    setSearchParams(params, { replace: params.toString() === queryString });
  };

  return (
    <Stack vertical gap='var(--ui-page-gap)'>
      <Guide
        title='물품 이름으로 기초 재료를 찾아볼 수 있습니다.'
        action={<CartButton scope='home' />}
        steps={
          <>
            <li>
              물품 이름을 입력하면 바로 검색합니다.{" "}
              <Text tone='secondary'>빈칸이면 모든 물품이 나옵니다.</Text>
            </li>
            <li>
              <Text strong>담기</Text>를 누르면 장바구니에 담깁니다.
            </li>
            <li>
              <Text strong>상세</Text>를 누르면 기초 재료를 볼 수 있습니다.
            </li>
          </>
        }
      />
      <ResultSearchForm
        filter={search}
        onSearch={navigateTo}
        loading={isFetching}
      />
      <ResultCards
        loading={isFetching}
        contents={results?.content ?? []}
        onAdd={addToCart}
        owned={owned}
      />
    </Stack>
  );
}
