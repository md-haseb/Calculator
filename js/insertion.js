import {validateForDisplay, isOperator} from './validation.js';
import {normalToSuperscript} from './constants.js';

// const operators = '+*/-';
// const root = '√';
// const decimal = '.';

// const normalToSuperscript = {
//   "0":"\u2070",
//   "1":"\u00B9",
//   "2":"\u00B2",
//   "3":"\u00B3",
//   "4":"\u2074",
//   "5":"\u2075",
//   "6":"\u2076",
//   "7":"\u2077",
//   "8":"\u2078",
//   "9":"\u2079"
// };

//to insert input inside bracket
export function insertValueInsideBracket(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  if(lastChar === ')'){
    const firstClosingBracketIndex = currentInput.indexOf(')');
    const lastExponentChar = currentInput[firstClosingBracketIndex - 1];
    const beforeClosingBracket = currentInput.slice(0, firstClosingBracketIndex);
    const afterClosingBracket = currentInput.slice(firstClosingBracketIndex); 
    if(newValue.includes("□")){
      return `${showExponentBox(beforeClosingBracket, newValue)}${afterClosingBracket}`;
    }
    if(currentInput.includes("□")){
      return `${showExponent(beforeClosingBracket, newValue)}${afterClosingBracket}`;
    }
    if(Object.values(normalToSuperscript).includes(lastExponentChar)){
      return `${showExponent(beforeClosingBracket, newValue)}${afterClosingBracket}`;
    }
    return `${beforeClosingBracket}${newValue}${afterClosingBracket}`;
  }
  return currentInput + newValue;
}

export function showExponentBox(currentInput, newValue){
  if(validateForDisplay(currentInput, newValue)){
    return `${currentInput}<sup>□</sup>`;
  }
  return currentInput;
}

export function showExponent(currentInput, newValue){
  
  const lastChar = currentInput[currentInput.length - 1];

  if(["□"].includes(lastChar)){
    return currentInput.slice(0, -1) + newValue.split('').map(d => normalToSuperscript[d]).join('');
  }else if(Object.values(normalToSuperscript).includes(lastChar)){
    return currentInput + newValue.split('').map(d => normalToSuperscript[d]).join('');
  }else{
    return currentInput + newValue;
  }
}

export function replaceOperator(currentInput, newValue){
  // const lastChar = currentInput[currentInput.length - 1];
  // if(validateForDisplay(currentInput, newValue) === 'replace'){
  //   if((isOperator(lastChar)) && isOperator(newValue)){
  //     return currentInput.slice(0, -1) + newValue;
  //   }
  // }
  return currentInput.slice(0, -1) + newValue;
}