import { Button, Container, Snackbar, Stack } from "@mui/material";
import { useResultMutation } from "queries/useResultMutation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateItem } from "view/CreateItem";

export function Manage() {
  const navigate = useNavigate();
  const { mutate } = useResultMutation();
  const [open, setOpen] = useState(false);

  return (
    <Container maxWidth='lg'>
      <Stack direction={"row"} gap='10px' style={{ padding: "5px" }}>
        <Button variant='contained' onClick={() => navigate("market")}>
          시세 리스트
        </Button>
        <Button variant='contained' onClick={() => navigate("item")}>
          상품 리스트
        </Button>
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          message='결과가 생성되었습니다.'
        />
        <Button
          variant='contained'
          onClick={() => mutate(undefined, { onSuccess: () => setOpen(true) })}
        >
          결과 리스트 생성
        </Button>
      </Stack>
      <CreateItem />
    </Container>
  );
}
