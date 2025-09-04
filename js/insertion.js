

const operators = '+*/-';
const root = '√';
const decimal = '.';

//to insert input inside bracket
export function insertValueInsideBracket(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  if(lastChar === ')'){
    let firstClosingBracket = currentInput.indexOf(')');
    return currentInput.slice(0, firstClosingBracket) + newValue + currentInput.slice(firstClosingBracket);
  }
}

export function showExponentBox(input, currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  if(![operators, root, decimal].includes(lastChar)){
    input.innerHTML = `${currentInput}<sup>□</sup>`;
    return input.textContent;
  }
  return null;
}

export function showExponent(input, currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  if(["□"].includes(lastChar)){
    input.innerHTML = input.innerHTML.replace(/<sup>.*?<\/sup>/, "");
    input.innerHTML = `${input.textContent}<sup>${newValue}</sup>`;
    return input.textContent;
  }
}