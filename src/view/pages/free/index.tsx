import { Container } from "@mui/material";
import { Header } from "view/components/Header";
import { ResultList } from "view/components/home/ResultList";

export function Free() {
  return (
    <Container maxWidth='lg' style={{ textAlign: "center" }}>
      <Header />
      <ResultList />
    </Container>
  );
}
