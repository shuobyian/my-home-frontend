import { Typography } from "@mui/material";

export function Header() {
  return (
    <div style={{ display: "fixed", top: 0, padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant='h3' fontWeight={700}>
          놀러와 마이홈 제작 계산기
        </Typography>
        <div />
      </div>
    </div>
  );
}
