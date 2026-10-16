// 엑셀 파일 읽기·쓰기. xlsx는 크기가 커서 필요할 때만 불러온다(동적 import).

// 첫 번째 시트의 행을 헤더 기준 객체 배열로 읽는다
export async function readFirstSheet(file: File): Promise<unknown[]> {
  const [XLSX, buffer] = await Promise.all([
    import("xlsx"),
    file.arrayBuffer(),
  ]);
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return sheet ? XLSX.utils.sheet_to_json(sheet) : [];
}

// 객체 배열을 시트 하나짜리 엑셀 파일로 내려받는다
export async function downloadSheet(rows: object[], fileName: string) {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(rows),
    "Sheet1"
  );
  XLSX.writeFile(workbook, fileName);
}

// 파일 이름에 쓸 날짜(예: 20261017-1430). 공백·콜론이 없어 모든 OS에서 안전하다.
export function fileTimestamp(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}`
  );
}
