// 천 단위 콤마. null·undefined·NaN이면 빈 문자열
export function formatNumber(number?: number | null) {
  if (number === undefined || number === null || Number.isNaN(number))
    return "";

  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 천 단위 콤마 + '골드'
export function formatGold(number: number) {
  return `${formatNumber(number)}골드`;
}
