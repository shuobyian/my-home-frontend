import { Typography } from "@mui/material";

export function Header() {
  return (
    <div style={{ display: "fixed", top: 0, padding: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            margin: "auto",
          }}
        >
          <Typography variant='h3' fontWeight={700}>
            놀러와 마이홈 제작 계산기
          </Typography>
          <Typography>
            물품 이름과 수량을 입력해주세요. 기초 재료를 확인하실 수 있습니다.
          </Typography>
          <Typography>빈칸 입력 시 모든 물품 확인이 가능합니다.</Typography>
          <Typography marginTop='10px' fontWeight={700}>
            사진 제공: 루나응애 님, 떵히쭈 님
          </Typography>
        </div>
        <div />
      </div>
    </div>
  );
}
