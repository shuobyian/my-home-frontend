import { Button, Input, Space, Typography } from "antd";
import { ROUTES } from "app/routes";
import { useCalculateResultsQuery } from "queries/result";
import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Market } from "types/market";
import { Result } from "types/result";
import { STORAGE_KEY } from "lib/storage";
import { ResultList } from "view/components/home/ResultList";

const RESULT_LIST = localStorage.getItem(STORAGE_KEY.RESULT);

export function FreeResult() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 주소로 직접 들어오면 state가 없다. 이때는 시세 입력 화면으로 돌려보낸다.
  const { state } = useLocation() as {
    state: { markets?: Market[] } | null;
  };
  const markets = state?.markets;

  const { isLoading, isError, data } = useCalculateResultsQuery(
    { markets: markets ?? [] },
    { enabled: !!markets }
  );

  const [resultList, setResultList] = useState<Result[]>([]);
  const [name, setName] = useState("");

  const onSave = () => {
    if (data) localStorage.setItem(STORAGE_KEY.RESULT, JSON.stringify(data));
  };

  const keyPressEnter = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") buttonRef.current?.click();
  };

  const onSubmit = () => {
    setResultList(data?.filter((d) => d.name.includes(name)) || []);
  };

  useEffect(() => {
    setResultList(RESULT_LIST ? JSON.parse(RESULT_LIST) : data);
  }, [data]);

  if (!markets) return <Navigate to={ROUTES.FREE} replace />;

  return (
    <Space direction='vertical'>
      <Button
        type='primary'
        onClick={onSave}
        style={{ float: "right", margin: "10px" }}
      >
        로컬에 저장하기
      </Button>
      <Typography.Title level={5}>
        이 결과는 서버에 저장되지 않으며 현재 접속 중인 브라우저에 저장할 수
        있습니다.
      </Typography.Title>
      <Space
        style={{
          padding: "10px",
          border: "1px solid #eeeeee",
          borderRadius: "10px",
          gap: "10px",
          width: "100%",
        }}
      >
        <Input
          placeholder='물품명 입력'
          value={name}
          onChange={(e) => setName(e.target.value)}
          onPressEnter={keyPressEnter}
        />
        <Button ref={buttonRef} onClick={onSubmit}>
          검색
        </Button>
      </Space>
      {isError ? (
        <Typography.Text>결과를 불러올 수 없습니다.</Typography.Text>
      ) : (
        <ResultList loading={isLoading} contents={resultList || []} />
      )}
    </Space>
  );
}
