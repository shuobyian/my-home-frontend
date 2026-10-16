import { App, Button, Divider, Space, Typography } from "antd";
import { getErrorMessage } from "apis/errors";
import { ExcelButton } from "components/product/ExcelButton";
import { ProductNameList } from "components/product/ProductNameList";
import { ProductTableView } from "components/product/ProductTableView";
import {
  diffProducts,
  nextProductId,
  parseSavedProducts,
} from "domain/productExcel";
import { formatNumber } from "lib/format";
import { readJSON, STORAGE_KEY, writeJSON } from "lib/storage";
import { useCreateProductsMutation } from "queries/product";
import { useState } from "react";
import { Product } from "types/product";

// 엑셀로 가져온 물품을 브라우저에서 편집하고 서버에 일괄 저장한다
export function RawProductTable() {
  const { message, modal } = App.useApp();
  const { mutate: upload } = useCreateProductsMutation();

  // 저장된 값은 마운트할 때 한 번 읽는다(모듈 최상단에서 읽으면 앱 시작 시점 값에 고정된다)
  const [products, setProducts] = useState<Product[]>(() =>
    parseSavedProducts(readJSON(STORAGE_KEY.PRODUCT))
  );
  // 마지막으로 가져오거나 저장한 시점의 목록(변경 사항 비교 기준)
  const [baseline, setBaseline] = useState<Product[]>(products);

  const importProducts = (imported: Product[]) => {
    setProducts(imported);
    setBaseline(imported);
  };

  const save = (snapshot: Product[]) => {
    writeJSON(STORAGE_KEY.PRODUCT, snapshot);

    upload(
      // 서버는 id를 무시하므로 보내지 않는다
      { products: snapshot.map(({ id, ...product }) => product) },
      {
        onSuccess: (saved) => {
          setBaseline(snapshot);
          modal.info({
            title: `${formatNumber(saved.length)}개 물품이 추가되었습니다.`,
            content: <ProductNameList products={saved} />,
            okText: "확인",
          });
        },
        onError: (error) => {
          message.error(getErrorMessage(error));
        },
      }
    );
  };

  const confirmSave = () => {
    const snapshot = products;
    const { added, updated, removed } = diffProducts(baseline, snapshot);
    const sections = [
      { label: "추가", items: added },
      { label: "수정", items: updated },
      { label: "삭제", items: removed },
    ].filter(({ items }) => items.length > 0);

    modal.confirm({
      title: "저장하시겠습니까?",
      content: (
        <>
          <Typography.Paragraph type='secondary'>
            일괄 저장은 서버에 없는 이름의 물품만 추가합니다. 이미 있는 물품의
            수정·삭제는 반영되지 않으니 '물품 리스트'에서 해주세요.
          </Typography.Paragraph>
          {sections.length === 0 ? (
            <Typography.Text>
              마지막 저장 이후 바뀐 물품이 없습니다.
            </Typography.Text>
          ) : (
            sections.map(({ label, items }) => (
              <div key={label}>
                <Typography.Text strong>
                  {label} {formatNumber(items.length)}개
                </Typography.Text>
                <ProductNameList products={items} />
              </div>
            ))
          )}
        </>
      ),
      onOk: () => save(snapshot),
      okText: "확인",
      cancelText: "취소",
    });
  };

  return (
    <>
      <Typography.Title level={4}>Raw 엑셀 데이터</Typography.Title>
      <ProductTableView
        products={products}
        total={products.length}
        onAdd={async (product) => {
          setProducts((prev) => [
            { ...product, id: nextProductId(prev) },
            ...prev,
          ]);
          message.success("추가되었습니다");
        }}
        onEdit={async (product) => {
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? product : p))
          );
          message.success("수정되었습니다");
        }}
        onRemove={async (targets) => {
          const ids = new Set(targets.map(({ id }) => id));
          setProducts((prev) => prev.filter(({ id }) => !ids.has(id)));
          message.success("삭제되었습니다");
        }}
        toolbarExtra={
          <Button onClick={confirmSave} type='primary'>
            저장
          </Button>
        }
      />
      <Divider type='horizontal' />
      <Space>
        <ExcelButton products={products} onImport={importProducts} />
      </Space>
    </>
  );
}
