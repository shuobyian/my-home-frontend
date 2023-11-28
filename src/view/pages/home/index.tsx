import { Layout } from "antd";
import { Header } from "view/components/Header";
import { Result } from "view/components/home/Result";

export function Home() {
  return (
    <Layout style={{ textAlign: "center", padding: "10px 100px" }}>
      <Header />
      <Result />
    </Layout>
  );
}
