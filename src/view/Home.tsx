import { Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CreateItem } from "./CreateItem";
import { useResultMutation } from "../queries/useResultMutation";

export function Home() {
  const navigate = useNavigate();
  const { mutate } = useResultMutation();
  return (
    <Container maxWidth='sm'>
      <Button onClick={() => navigate("/list")}>상품 리스트</Button>
      <Button onClick={() => mutate()}>결과 리스트 생성</Button>
      <CreateItem />
    </Container>
  );
}
