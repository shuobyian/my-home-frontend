import { Stack, Typography } from "@mui/material";

export function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <Stack direction={"row"} gap='10px'>
      <Typography style={{ minWidth: "110px" }} fontWeight={700}>
        {title}
      </Typography>
      <Typography style={{ flexGrow: 1 }}>{value}</Typography>
    </Stack>
  );
}
