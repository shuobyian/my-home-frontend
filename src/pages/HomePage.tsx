import { useAddToCart } from "@/components/cart/useAddToCart";
import { ResultSearchForm } from "@/components/result/ResultSearchForm";
import { ResultTable } from "@/components/result/ResultTable";
import {
  parseResultSearch,
  ResultSearchState,
  toResultSearchParams,
} from "@/domain/resultSearch";
import { useResultsQuery } from "@/queries/result";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { Stack, Text } from "@/ui";

const PAGE_SIZE = 10;

// 홈: 결과 검색. 검색 조건과 페이지는 URL에 두어 뒤로 가기·새로고침·공유 시에도 유지한다.
export function HomePage() {
  const addToCart = useAddToCart("server");

  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const search = useMemo(
    () => parseResultSearch(new URLSearchParams(queryString)),
    [queryString]
  );

  const {
    data: results,
    isFetching,
    isPlaceholderData,
  } = useResultsQuery({
    page: search.page,
    size: PAGE_SIZE,
    name: search.name || undefined,
    tool: search.tool,
    category: search.category,
  });

  // 같은 주소로의 이동은 히스토리에 쌓지 않는다(링크 클릭과 같은 규칙)
  const navigateTo = (next: ResultSearchState) => {
    const params = toResultSearchParams(next);
    setSearchParams(params, { replace: params.toString() === queryString });
  };

  // 주소의 페이지가 결과 범위를 넘으면(오래된 링크 등) 마지막 페이지로 바로잡는다
  useEffect(() => {
    if (!results || isPlaceholderData) return;
    const lastPage = Math.max(
      0,
      Math.ceil(results.totalElements / PAGE_SIZE) - 1
    );
    if (search.page > lastPage) {
      setSearchParams(toResultSearchParams({ ...search, page: lastPage }), {
        replace: true,
      });
    }
  }, [results, isPlaceholderData, search, setSearchParams]);

  return (
    <Stack vertical>
      <Stack vertical gap={0}>
        <Text>물품 이름을 입력해주세요. 기초 재료를 확인하실 수 있습니다.</Text>
        <Text>빈칸 입력 시 모든 물품 확인이 가능합니다.</Text>
        <Text>
          물품을 누르면 장바구니에 담깁니다. 펼치기(+)로 상세 정보를 볼 수
          있습니다.
        </Text>
      </Stack>
      <ResultSearchForm
        filter={search}
        onSearch={(filter) => navigateTo({ ...filter, page: 0 })}
      />
      <ResultTable
        loading={isFetching}
        pagination={{
          page: search.page,
          size: PAGE_SIZE,
          total: results?.totalElements ?? 0,
          onChange: (page) => navigateTo({ ...search, page: page - 1 }),
        }}
        contents={results?.content ?? []}
        onRowClick={addToCart}
      />
    </Stack>
  );
}
