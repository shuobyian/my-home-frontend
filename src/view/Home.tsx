import { Container } from "@mui/material";
import { Header } from "./components/Header";
import { ResultList } from "./components/ResultList";

export function Home() {
  return (
    <Container maxWidth='lg' style={{ textAlign: "center" }}>
      <Header />
      <ResultList />
    </Container>
  );
}
