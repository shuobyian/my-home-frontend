import { CartButton } from "@/components/cart/CartButton";
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

// 쪽을 나누지 않고 한 번에 받는다. 전체 결과 수보다 넉넉한 크기
// ponytail: 결과가 이 개수를 넘으면 뒤쪽이 잘린다. 그때는 무한 스크롤로 나눠 받는다
const ALL_RESULTS = 2000;

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

  const { data: results, isFetching } = useResultsQuery({
    page: 0,
    size: ALL_RESULTS,
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
    <Stack vertical>
      {/* 버튼을 먼저 두고 순서를 뒤집어, 좁은 화면에서도 버튼이 맨 위 오른쪽에 오게 한다 */}
      <Stack
        justify='space-between'
        align='flex-start'
        wrap
        style={{ flexDirection: "row-reverse" }}
      >
        <CartButton />
        <Stack vertical gap={0}>
          <Text>
            물품 이름을 입력해주세요. 기초 재료를 확인하실 수 있습니다.
          </Text>
          <Text>빈칸 입력 시 모든 물품 확인이 가능합니다.</Text>
          <Text>
            담기로 장바구니에 담고, 상세로 기초 재료를 볼 수 있습니다.
          </Text>
        </Stack>
      </Stack>
      <ResultSearchForm filter={search} onSearch={navigateTo} />
      <ResultCards
        loading={isFetching}
        contents={results?.content ?? []}
        onAdd={addToCart}
        owned={owned}
      />
    </Stack>
  );
}
