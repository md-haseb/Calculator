import {validateForDisplay} from './validation.js';

const operators = '+*/-';
const root = '√';
const decimal = '.';

//to insert input inside bracket
export function insertValueInsideBracket(input, currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  if(lastChar === ')'){
    let firstClosingBracket = currentInput.indexOf(')');
    // if(newValue.includes("□")){
    //   currentInput = currentInput.slice(0, firstClosingBracket);
    //   input.innerHTML = showExponentBox(input, currentInput, newValue);
    //   currentInput = currentInput + ')';
    //   return input.textContent;
    // }
    return currentInput.slice(0, firstClosingBracket) + newValue + currentInput.slice(firstClosingBracket);
  }
}

export function showExponentBox(input, currentInput, newValue){
  // const lastChar = currentInput[currentInput.length - 1];
  if(validateForDisplay(currentInput, newValue)){
    input.innerHTML = `${currentInput}<sup>□</sup>`;
    return input.innerHTML;
  }
  return null;
}

export function showExponent(input, currentInput, newValue){
  const normalToSuperscript = {
    "0":"\u2070",
    "1":"\u00B9",
    "2":"\u00B2",
    "3":"\u00B3",
    "4":"\u2074",
    "5":"\u2075",
    "6":"\u2076",
    "7":"\u2077",
    "8":"\u2078",
    "9":"\u2079"
  };

  const lastChar = currentInput[currentInput.length - 1];

  if(["□"].includes(lastChar)){
    input.textContent = currentInput.slice(0, -1) + newValue.split('').map(d => normalToSuperscript[d]).join('');
  }else if(Object.values(normalToSuperscript).includes(lastChar)){
    input.textContent = input.textContent + newValue.split('').map(d => normalToSuperscript[d]).join('');
  }else{
    input.textContent += newValue;
  }
  return input.textContent;
}