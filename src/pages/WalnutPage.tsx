import { Alert, Button, Space } from "antd";
import { getErrorMessage } from "apis/errors";
import { ROUTES } from "app/routes";
import { useAddToCart } from "components/cart/useAddToCart";
import { WalnutForm } from "components/walnut/WalnutForm";
import { WalnutGuide } from "components/walnut/WalnutGuide";
import { WalnutResult } from "components/walnut/WalnutResult";
import { parseWalnutParams, toWalnutSearchParams } from "domain/experience";
import { useWalnutQuery } from "queries/experience";
import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

  const { data, isFetching, isError, error } = useWalnutQuery(params);

  return (
    <Space direction='vertical' style={{ width: "100%" }} size='large'>
      <div>
        <Button
          onClick={() => navigate(ROUTES.EXPERIENCE)}
          style={{ float: "right" }}
        >
          레벨별 필요한 경험치
        </Button>
        <WalnutGuide />
      </div>
      <WalnutForm
        initialValues={params}
        loading={isFetching}
        onSubmit={(values) => setSearchParams(toWalnutSearchParams(values))}
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
        <WalnutResult result={data} onSelectAmple={addToCart} />
      )}
    </Space>
  );
}
