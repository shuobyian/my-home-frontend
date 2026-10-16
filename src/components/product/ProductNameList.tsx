import { Product } from "types/product";

// 확인 모달에 넣는 물품 이름 목록
export function ProductNameList({
  products,
}: {
  products: Pick<Product, "id" | "name">[];
}) {
  return (
    <ul style={{ maxHeight: 400, overflow: "auto", paddingLeft: 20 }}>
      {products.map(({ id, name }) => (
        <li key={id}>{name}</li>
      ))}
    </ul>
  );
}
