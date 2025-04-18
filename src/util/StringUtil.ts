function numberWithCommas(number?: number | null) {
  if (number === undefined || number === null || Number.isNaN(number))
    return "";

  const numberString = number.toString();
  return `${numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function numberWithCommasAndMoney(number: number) {
  return `${numberWithCommas(number)}골드`;
}

export const StringUtil = {
  numberWithCommas,
  numberWithCommasAndMoney,
};
