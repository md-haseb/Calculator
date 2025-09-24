import {validateForDisplay, isOperator} from './validation.js';
import {normalToSuperscript} from './constants.js';
import {caretShowWithFocus, caretIndex} from './caretAndArrow.js';

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
export function insertValueInsideBracket(element, currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  const caretPosition = caretIndex(element); 
  // if(lastChar === ')'){
    // const lastClosingBracketIndex = currentInput.lastIndexOf(')');
    const lastExponentChar = currentInput[caretPosition - 1];
    const exponentBox = currentInput[caretPosition];
    const withExponentBox = currentInput.slice(0, caretPosition + 1);
    const afterExponentBox = currentInput.slice(caretPosition + 1);
    const beforeCaret = currentInput.slice(0, caretPosition);
    const afterCaret = currentInput.slice(caretPosition);
    if(newValue.includes("□")){
      return `${showExponentBox(beforeCaret, newValue)}${afterCaret}`;
    }
    if(currentInput.includes("□")){
      return `${showExponent(element, withExponentBox, newValue)}${afterExponentBox}`;
    }
    if(Object.values(normalToSuperscript).includes(lastExponentChar)){
      return `${showExponent(element, beforeCaret, newValue)}${afterCaret}`;
    }
    return `${beforeCaret}${newValue}${afterCaret}`;
  // }
  // return currentInput + newValue;
}

export function showExponentBox(currentInput, newValue){
  if(validateForDisplay(currentInput, newValue)){
    return `${currentInput}<sup>□</sup>`;
  }
  return currentInput;
}

export function showExponent(element, currentInput, newValue){
  
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

// const caretPosition = caretIndex(element); 
//   const exponentBox = currentInput[caretPosition + 1];
//   const exponent = currentInput[caretPosition - 1];
//   console.log(currentInput.split(''));

//   if(["□"].includes(exponentBox)){
//     return currentInput.slice(0, exponentBox) + newValue.split('').map(d => normalToSuperscript[d]).join('');
//   }else if(Object.values(normalToSuperscript).includes(exponent)){
//     return currentInput + newValue.split('').map(d => normalToSuperscript[d]).join('');
//   }else{
//     return currentInput + newValue;
//   }