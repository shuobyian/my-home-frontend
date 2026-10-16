import { Alert, Button, Flex, Space, Spin } from "antd";
import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { WalnutForm } from "@/components/walnut/WalnutForm";
import { WalnutGuide } from "@/components/walnut/WalnutGuide";
import { WalnutResult } from "@/components/walnut/WalnutResult";
import { parseWalnutParams, toWalnutSearchParams } from "@/domain/experience";
import { useWalnutQuery } from "@/queries/experience";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WalnutParams } from "@/types/experience";

// 호두작 계산. 계산 조건은 URL에 두어 경험치 표에 다녀오거나 새로고침해도 결과가 유지된다.
export function WalnutPage() {
  const navigate = useNavigate();
  const addToCart = useAddToCart("walnut");

  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const params = useMemo(
    () => parseWalnutParams(new URLSearchParams(queryString)),
    [queryString]
  );

  const { data, isFetching, isPlaceholderData, isError, error, refetch } =
    useWalnutQuery(params);

  const submit = (values: WalnutParams) => {
    const next = toWalnutSearchParams(values);
    // 같은 조건으로 다시 누르면 다시 계산한다(실패 후 재시도 포함). 히스토리는 쌓지 않는다.
    if (next.toString() === queryString) {
      refetch();
      return;
    }
    setSearchParams(next);
  };

  return (
    <Space direction='vertical' style={{ width: "100%" }} size='large'>
      {/* 버튼을 먼저 두고 순서를 뒤집어, 좁은 화면에서도 버튼이 맨 위 오른쪽에 오게 한다 */}
      <Flex
        justify='space-between'
        align='flex-start'
        wrap
        gap={8}
        style={{ flexDirection: "row-reverse" }}
      >
        <Button onClick={() => navigate(ROUTES.EXPERIENCE)}>
          레벨별 필요한 경험치
        </Button>
        <WalnutGuide />
      </Flex>
      <WalnutForm
        initialValues={params}
        loading={isFetching}
        onSubmit={submit}
      />
      {isError && (
        <Alert
          type='error'
          showIcon
          message='계산할 수 없습니다.'
          description={getErrorMessage(error)}
        />
      )}
      {data && !isError && (
        // 새 조건을 계산하는 동안 보이는 이전 결과는 흐리게 두고 장바구니에 담지 못하게 한다.
        // (v5는 마지막으로 성공한 결과를 보여 주므로 직전 계산이 실패했어도 그 전 결과가 보일 수 있다)
        <Spin spinning={isPlaceholderData}>
          <WalnutResult
            result={data}
            onSelectAmple={isPlaceholderData ? undefined : addToCart}
          />
        </Spin>
      )}
    </Space>
  );
}
