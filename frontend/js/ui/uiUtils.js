

/**
 * Helper: Replace '×' with '*' for calculation
 * @returns {string} Modified input text
 */
// export function changeMultiplySign(inputText){
//   return inputText.replaceAll('×', '*');
// }
export function changeMultiplySign(inputText) {
  return inputText.replace(/[×⋅]/g, '*');
}
