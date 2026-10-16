import { App, Button, Space, Typography } from "antd";
import { parseExcelRows, productsToExcelRows } from "domain/productExcel";
import { downloadSheet, fileTimestamp, readFirstSheet } from "lib/excel";
import { formatNumber } from "lib/format";
import { useRef, useState } from "react";
import { Product } from "types/product";

// 오류가 많을 때 모달에 보여 줄 최대 줄 수
const MAX_ERROR_LINES = 20;

interface ExcelButtonProps {
  // 내려받을 물품 목록
  products: Product[];
  // 검증을 통과한 엑셀 행을 물품 목록으로 전달한다
  onImport: (products: Product[]) => void;
}

export function ExcelButton({ products, onImport }: ExcelButtonProps) {
  const { message, modal } = App.useApp();
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const importFile = async (file: File) => {
    setLoading(true);
    try {
      const { products: imported, errors } = parseExcelRows(
        await readFirstSheet(file)
      );
      // 한 행이라도 문제가 있으면 가져오지 않는다(일부만 가져오면 무엇이 빠졌는지 놓치기 쉽다)
      if (errors.length > 0) {
        modal.error({
          title: `${formatNumber(errors.length)}개 행에 문제가 있어 가져오지 않았습니다.`,
          width: 560,
          content: (
            <ul style={{ maxHeight: 400, overflow: "auto", paddingLeft: 20 }}>
              {errors.slice(0, MAX_ERROR_LINES).map((error) => (
                <li key={error}>
                  <Typography.Text>{error}</Typography.Text>
                </li>
              ))}
              {errors.length > MAX_ERROR_LINES && (
                <li>외 {formatNumber(errors.length - MAX_ERROR_LINES)}개</li>
              )}
            </ul>
          ),
        });
        return;
      }
      onImport(imported);
      message.success(
        `${formatNumber(imported.length)}개 물품을 가져왔습니다.`
      );
    } catch {
      message.error("엑셀 파일을 읽을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importFile(file);
    // 같은 파일을 다시 골라도 change 이벤트가 나도록 비운다
    e.target.value = "";
  };

  return (
    <Space>
      <Button loading={loading} onClick={() => ref.current?.click()}>
        가져오기
      </Button>
      <input
        type='file'
        accept='.xlsx,.xls'
        ref={ref}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <Button
        onClick={() =>
          downloadSheet(
            productsToExcelRows(products),
            `my_home_material_${fileTimestamp(new Date())}.xlsx`
          )
        }
      >
        내려받기
      </Button>
    </Space>
  );
}
