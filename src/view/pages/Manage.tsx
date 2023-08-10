import { useNavigate } from "react-router-dom";
import { useResultMutation } from "../../queries/useResultMutation";
import { Button, Container, Stack } from "@mui/material";
import { CreateItem } from "../CreateItem";

export function Manage() {
  const navigate = useNavigate();
  const { mutate } = useResultMutation();

  return (
    <Container maxWidth='sm'>
      <Stack>
        <Stack direction={"row"} gap='10px' style={{ padding: "5px" }}>
          <Button variant='contained' onClick={() => navigate("list")}>
            상품 리스트
          </Button>
          <Button variant='contained' onClick={() => mutate()}>
            결과 리스트 생성
          </Button>
        </Stack>
        <CreateItem />
      </Stack>
    </Container>
  );
}
