import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useLoginMutation } from "queries/useLoginMutation";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export function ManageRoute() {
  const navigate = useNavigate();

  const { mutate: login } = useLoginMutation();

  const [modalOpen, setModalOpen] = useState(true);
  const [password, setPassword] = useState("");

  return (
    <>
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
      <Outlet />
    </>
  );
}
