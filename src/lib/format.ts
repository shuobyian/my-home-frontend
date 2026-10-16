// 천 단위 구분 기호, 소수는 둘째 자리까지(서버 금액·수량은 소수일 수 있다)
const numberFormat = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

// null·undefined·NaN이면 빈 문자열
export function formatNumber(number?: number | null) {
  if (number === undefined || number === null || Number.isNaN(number))
    return "";

  return numberFormat.format(number);
}

// 천 단위 구분 기호 + '골드'
export function formatGold(number: number) {
  return `${formatNumber(number)}골드`;
}
