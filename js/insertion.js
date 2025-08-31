
//to insert input inside bracket
export function insertValueInsideBracket(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  if(lastChar === ')'){
    let firstClosingBracket = currentInput.indexOf(')');
    return currentInput.slice(0, firstClosingBracket) + newValue + currentInput.slice(firstClosingBracket);
  }
}