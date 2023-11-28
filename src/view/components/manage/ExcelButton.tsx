import { Button, Space } from "antd";
import { Item, RawItem } from "apis/getItems";
import { useRef } from "react";
import { convertExcelToTable, convertTableToExcel } from "util/convertItem";
import * as XLSX from "xlsx";

interface IExcelButtonProps {
  datas: Item[];
  setDatas: React.Dispatch<React.SetStateAction<Item[]>>;
}

export function ExcelButton({ datas, setDatas }: IExcelButtonProps) {
  const ref = useRef<HTMLInputElement>(null);

  const excelDownload = (data: object[], fileName: string) => {
    const excelFileName = `${fileName}_${new Date()}.xlsx`;

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    XLSX.writeFile(wb, excelFileName);
  };

  const handleExcelDownload = () => {
    excelDownload(convertTableToExcel(datas), "my_home_material");
  };

  const readExcel = async (file: File) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onload = (e: ProgressEvent<FileReader>) => {
      if (!e.target) return;
      const bufferArray = e.target.result;
      const fileInformation = XLSX.read(bufferArray, {
        type: "buffer",
        cellText: false,
        cellDates: true,
      });
      const sheetName = fileInformation.SheetNames[0];
      const rawData = fileInformation.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(rawData);

      data && setDatas(convertExcelToTable(data as RawItem[]));
    };
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    readExcel(file);
  };

  return (
    <Space>
      <div>
        <Button onClick={() => ref.current?.click()}>가져오기</Button>
        <input
          type='file'
          ref={ref}
          onChange={handleExcelFileChange}
          style={{ display: "none" }}
        />
      </div>
      <Button onClick={() => handleExcelDownload()}>내려받기</Button>
    </Space>
  );
}
