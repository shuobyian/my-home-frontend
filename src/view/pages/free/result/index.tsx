import {
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Result } from "apis/getResults";
import { IMarket } from "apis/putMarkets";
import { useCalculatorQuery } from "queries/useCalculatorQuery";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { RESULT } from "util/constant/LOCAL_STORAGE_KEY";
import { ResultList } from "view/components/home/ResultList";

const RESULT_LIST = localStorage.getItem(RESULT);

export function FreeResult() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    state: { markets },
  } = useLocation() as { state: { markets: IMarket[] } };

  const { isLoading, data } = useCalculatorQuery({ markets });

  const [resultList, setResultList] = useState<Result[]>([]);
  const [name, setName] = useState("");

  const onSave = () => {
    if (data) localStorage.setItem(RESULT, JSON.stringify(data));
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

  return (
    <Container maxWidth='lg' style={{ textAlign: "right" }}>
      <Button variant='outlined' onClick={onSave} style={{ margin: "10px" }}>
        로컬에 저장하기
      </Button>
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Typography variant='h6'>
          이 결과는 서버에 저장되지 않으며 현재 접속 중인 브라우저에 저장할 수
          있습니다.
        </Typography>
      </div>
      <Stack
        style={{
          padding: "10px",
          border: "1px solid #eeeeee",
          borderRadius: "10px",
        }}
        direction={"row"}
        gap='10px'
      >
        <TextField
          variant='outlined'
          size='small'
          placeholder='물품명 입력'
          value={name}
          onChange={(e) => setName(e.target.value)}
          inputProps={{
            onKeyDown: (e) => keyPressEnter(e),
          }}
        />
        <Button ref={buttonRef} variant='contained' onClick={onSubmit}>
          검색
        </Button>
      </Stack>
      {isLoading ? (
        <CircularProgress style={{ marginTop: "20vh" }} color='inherit' />
      ) : (
        <ResultList contents={resultList || []} />
      )}
    </Container>
  );
}
