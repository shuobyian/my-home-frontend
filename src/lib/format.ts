// 천 단위 구분 기호, 소수는 둘째 자리까지(서버 금액·수량은 소수일 수 있다)
const numberFormat = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

// 0이 아닌데 둘째 자리 반올림으로 0이 되는 아주 작은 값은 유효 숫자 2자리로 보여 준다
const smallNumberFormat = new Intl.NumberFormat("ko-KR", {
  maximumSignificantDigits: 2,
});

// null·undefined·NaN이면 빈 문자열
export function formatNumber(number?: number | null) {
  if (number === undefined || number === null || Number.isNaN(number))
    return "";
  // -0은 0으로
  const value = number || 0;
  if (value !== 0 && Math.abs(value) < 0.005) {
    return smallNumberFormat.format(value);
  }
  return numberFormat.format(value);
}

// 천 단위 구분 기호 + '골드'
export function formatGold(number: number) {
  return `${formatNumber(number)}골드`;
}
