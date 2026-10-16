import { Button, Space } from "antd";
import {
  excelRowsToProducts,
  ProductExcelRow,
  productsToExcelRows,
} from "domain/productExcel";
import { useRef } from "react";
import { Product } from "types/product";
import * as XLSX from "xlsx";

interface ExcelButtonProps {
  // 내려받을 물품 목록
  products: Product[];
  // 가져온 엑셀을 물품 목록으로 변환해 전달한다
  onImport: (products: Product[]) => void;
}

export function ExcelButton({ products, onImport }: ExcelButtonProps) {
  const ref = useRef<HTMLInputElement>(null);

  const excelDownload = (data: object[], fileName: string) => {
    const excelFileName = `${fileName}_${new Date()}.xlsx`;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, excelFileName);
  };

  const readExcel = (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) return;
      const fileInformation = XLSX.read(e.target.result, {
        type: "buffer",
        cellText: false,
        cellDates: true,
      });
      const sheetName = fileInformation.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(fileInformation.Sheets[sheetName]);

      onImport(excelRowsToProducts(rows as ProductExcelRow[]));
    };
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readExcel(file);
    // 같은 파일을 다시 골라도 change 이벤트가 나도록 비운다
    e.target.value = "";
  };

  return (
    <Space>
      <div>
        <Button onClick={() => ref.current?.click()}>가져오기</Button>
        <input
          type='file'
          accept='.xlsx,.xls'
          ref={ref}
          onChange={handleExcelFileChange}
          style={{ display: "none" }}
        />
      </div>
      <Button
        onClick={() =>
          excelDownload(productsToExcelRows(products), "my_home_material")
        }
      >
        내려받기
      </Button>
    </Space>
  );
}
