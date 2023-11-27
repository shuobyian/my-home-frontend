import { Container } from "@mui/material";
import { Header } from "view/components/Header";
import { Result } from "view/components/home/Result";

export function Home() {
  return (
    <Container maxWidth='lg' style={{ textAlign: "center" }}>
      <Header />
      <Result />
    </Container>
  );
}
