export const toFixedDigits = (number_: number, digits: number): string => {
  let formattedNumber = String(number_)

  while (formattedNumber.length < digits) {
    formattedNumber = `0${formattedNumber}`
  }

  return formattedNumber
}
