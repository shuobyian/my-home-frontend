import { App, Button, Input, Space, Typography } from "antd";
import { getErrorMessage } from "@/apis/errors";
import { ROUTES } from "@/app/routes";
import { useAddToCart } from "@/components/cart/useAddToCart";
import { Panel } from "@/components/common/Panel";
import { ResultTable } from "@/components/result/ResultTable";
import { parseResultList } from "@/domain/result";
import { readJSON, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { useCalculateResultsQuery } from "@/queries/result";
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Market } from "@/types/market";
import { Result } from "@/types/result";

export function FreeResultPage() {
  const { message } = App.useApp();
  const addToCart = useAddToCart("free");

  // 주소로 직접 들어오면 state가 없다. 이때는 시세 입력 화면으로 돌려보낸다.
  const { state } = useLocation() as {
    state: { markets?: Market[] } | null;
  };
  const markets = state?.markets;

  const { isLoading, isError, error, data } = useCalculateResultsQuery(
    { markets: markets ?? [] },
    { enabled: !!markets }
  );

  // 브라우저에 저장해 둔 결과. 기본은 새로 계산한 결과를 보여 주고, 저장본은 명시적으로 연다.
  const [saved, setSaved] = useState<Result[] | undefined>(() =>
    parseResultList(readJSON(STORAGE_KEY.RESULT))
  );
  const [showSaved, setShowSaved] = useState(false);

  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const list = (showSaved ? saved : data) ?? [];
  const filtered = query ? list.filter((r) => r.name.includes(query)) : list;

  const onSave = () => {
    if (!data) return;
    if (!writeJSON(STORAGE_KEY.RESULT, data)) {
      message.error(
        "브라우저에 저장하지 못했습니다. 저장 공간이나 사이트 데이터 설정을 확인해주세요."
      );
      return;
    }
    setSaved(data);
    message.success("현재 결과를 브라우저에 저장했습니다.");
  };

  if (!markets) return <Navigate to={ROUTES.FREE} replace />;

  return (
    <Space direction='vertical' style={{ width: "100%" }}>
      <Space style={{ width: "100%", justifyContent: "space-between" }} wrap>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {showSaved ? "저장된 결과" : "입력한 시세로 계산한 결과"}
        </Typography.Title>
        <Space wrap>
          {showSaved ? (
            <Button onClick={() => setShowSaved(false)}>
              새 계산 결과 보기
            </Button>
          ) : (
            <Button onClick={() => setShowSaved(true)} disabled={!saved}>
              저장된 결과 불러오기
            </Button>
          )}
          <Button type='primary' onClick={onSave} disabled={showSaved || !data}>
            로컬에 저장하기
          </Button>
        </Space>
      </Space>
      <Typography.Text type='secondary'>
        이 결과는 서버에 저장되지 않으며 현재 접속 중인 브라우저에 저장할 수
        있습니다.
      </Typography.Text>
      <Panel>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder='물품명 입력'
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={() => setQuery(name)}
          />
          <Button onClick={() => setQuery(name)}>검색</Button>
        </Space.Compact>
      </Panel>
      {isError && !showSaved ? (
        <Typography.Text type='danger'>
          결과를 계산할 수 없습니다. {getErrorMessage(error)}
        </Typography.Text>
      ) : (
        <ResultTable
          loading={isLoading && !showSaved}
          contents={filtered}
          onRowClick={addToCart}
        />
      )}
    </Space>
  );
}
