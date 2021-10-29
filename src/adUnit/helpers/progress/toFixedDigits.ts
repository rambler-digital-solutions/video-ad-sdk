const toFixedDigits = (num: number, digits: number): string => {
  let formattedNum = String(num);

  while (formattedNum.length < digits) {
    formattedNum = '0' + formattedNum;
  }

  return formattedNum;
};

export default toFixedDigits;
