import { Container } from "@mui/material";
import { Header } from "view/components/Header";
import { ResultList } from "view/components/ResultList";

export function Home() {
  return (
    <Container maxWidth='lg' style={{ textAlign: "center" }}>
      <Header />
      <ResultList />
    </Container>
  );
}
