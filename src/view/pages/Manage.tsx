import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../queries/useLoginMutation";
import { useResultMutation } from "../../queries/useResultMutation";
import { CreateItem } from "../CreateItem";

export function Manage() {
  const navigate = useNavigate();
  const { mutate } = useResultMutation();
  const [open, setOpen] = useState(false);

  const { mutate: login } = useLoginMutation();

  const [modalOpen, setModalOpen] = useState(true);
  const [password, setPassword] = useState("");

  return (
    <Container maxWidth='lg'>
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        style={{ background: "black" }}
      >
        <Stack style={{ background: "white" }}>
          <DialogTitle>관리자만 입장 가능합니다.</DialogTitle>
          <DialogContent>
            <DialogContentText>
              입장하시려면 비밀번호를 입력해주세요.
            </DialogContentText>
            <TextField
              size='small'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='비밀번호 입력'
            />
            <DialogActions>
              <Button onClick={() => navigate("/")}>취소</Button>
              <Button
                onClick={() =>
                  login(password, {
                    onSuccess: () => setModalOpen(false),
                    onError: () => navigate("/"),
                  })
                }
                autoFocus
              >
                확인
              </Button>
            </DialogActions>
          </DialogContent>
        </Stack>
      </Dialog>
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
        <Button variant='contained' onClick={() => mutate()}>
          결과 리스트 생성
        </Button>
      </Stack>
      <CreateItem />
    </Container>
  );
}
