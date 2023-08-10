import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <div style={{ display: "fixed", top: 0, padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant='h3' fontWeight={700}>
          놀러와 마이홈 제작 계산기
        </Typography>
        <Button style={{ float: "right" }} onClick={() => navigate("/manage")}>
          관리자 페이지
        </Button>
      </div>
    </div>
  );
}
