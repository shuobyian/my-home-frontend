function numberWithCommas(number?: number | null) {
  if (number === undefined || number === null || Number.isNaN(number))
    return "";

  const numberString = number.toString();
  return `${numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export const StringUtil = {
  numberWithCommas,
};
