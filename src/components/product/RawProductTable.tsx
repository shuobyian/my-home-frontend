import { App, Button, Divider, Space, Typography } from "antd";
import { getErrorMessage } from "apis/errors";
import { ExcelButton } from "components/product/ExcelButton";
import { ProductNameList } from "components/product/ProductNameList";
import { ProductTableView } from "components/product/ProductTableView";
import {
  nextProductId,
  normalizeProductIds,
  parseSavedProducts,
  summarizeBulkSave,
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
  // 마지막으로 서버에 저장한 목록(저장 확인 요약의 기준). 엑셀을 가져와도 바꾸지 않는다.
  const [lastSaved, setLastSaved] = useState<Product[]>(products);

  const importProducts = (imported: Product[]) => {
    setProducts(normalizeProductIds(imported));
  };

  const save = (snapshot: Product[]) => {
    writeJSON(STORAGE_KEY.PRODUCT, snapshot);

    upload(
      // 서버는 id를 무시하므로 보내지 않는다
      { products: snapshot.map(({ id, ...product }) => product) },
      {
        onSuccess: (saved) => {
          setLastSaved(snapshot);
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
    const { toAdd, renamed, edited, removed } = summarizeBulkSave(
      lastSaved,
      snapshot
    );

    modal.confirm({
      title: "서버에 저장하시겠습니까?",
      width: 520,
      content: (
        <Space direction='vertical' style={{ width: "100%" }}>
          <Typography.Text type='secondary'>
            일괄 저장은 서버에 없는 이름의 물품만 추가합니다. 서버에 이미 있는
            이름은 건너뜁니다.
          </Typography.Text>
          {toAdd.length === 0 ? (
            <Typography.Text>
              마지막 저장 이후 추가할 새 이름이 없습니다.
            </Typography.Text>
          ) : (
            <div>
              <Typography.Text strong>
                추가 요청 {formatNumber(toAdd.length)}개
              </Typography.Text>
              <ProductNameList products={toAdd} />
            </div>
          )}
          {renamed.length > 0 && (
            <Typography.Text type='warning'>
              이름을 바꾼 {formatNumber(renamed.length)}개는 새 물품으로
              추가되고, 원래 이름의 물품은 서버에 그대로 남습니다.
            </Typography.Text>
          )}
          {(edited.length > 0 || removed.length > 0) && (
            <div>
              <Typography.Text type='warning'>
                반영되지 않는 변경: 수정 {formatNumber(edited.length)}개, 삭제{" "}
                {formatNumber(removed.length)}개. 기존 물품의 수정·삭제는 '물품
                리스트'에서 해주세요.
              </Typography.Text>
              <ProductNameList products={[...edited, ...removed]} />
            </div>
          )}
        </Space>
      ),
      onOk: () => save(snapshot),
      okButtonProps: { disabled: toAdd.length === 0 },
      okText: "저장",
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
            // 지운 행의 id를 재사용하지 않도록 마지막 저장본의 id도 함께 본다
            { ...product, id: nextProductId([...prev, ...lastSaved]) },
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
