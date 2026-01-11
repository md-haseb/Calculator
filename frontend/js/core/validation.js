import {operators, root, decimal, plus, minus, multiplyBy, multiplySymbol, divideBy, expBox, expBase, percent, factorial, parenOpen, parenClose, logFunctions, combinatorics, pi, E, superscriptChars, subscriptChars} from './constants.js';
import { tokenize } from "../core/tokenize.js";
import { getTokenAtCaret, getPrevToken, getNextToken } from "../core/tokenHelpers.js";


// const operators = '+*/-';
// const root = '√';
// const decimal = '.';

//for checking, is character is an operator
export function isOperator(char){
  return operators.includes(char);
}

//this function is about validate and allow for display or not
export function validateForDisplay(currentInput, newValue, caretPosition){
  const lastChar = currentInput[caretPosition - 1];
  const greaterLastChar = currentInput[caretPosition - 2];
  const nextChar = currentInput[caretPosition];

  const tokens = tokenize(currentInput);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  const greaterPrevToken = getPrevToken(tokens, prevToken);
  console.log(greaterPrevToken);
  const nextToken = getNextToken(tokens, currentToken);
  // const regex = new RegExp(`[${operators}]`);
  const operatorChars = operators.join('');
  const regex = new RegExp(
    `[${operatorChars.replace(/[-\\^]/g, '\\$&')}()\\s]`
  );

  console.log(prevToken);
  console.log(prevToken?.value);
  console.log(currentToken);
  console.log(currentToken?.type);
  console.log(nextToken);
  console.log(nextToken?.type);

  //Do not display operator first when input is empty (except - and .)
  const isEmptyInput = !currentInput?.length;

    if (isEmptyInput) {
      if ([multiplySymbol, divideBy].includes(newValue)) {
        return { allowed: false, message: 'Please enter a number before using (× or /).'};
      }
      if (newValue.startsWith(expBase)) {
        return { allowed: false, message: 'Please enter a number before using exponent operators.'};
      }
      if (newValue.includes(factorial)) {
        return { allowed: false, message: 'Please enter a number before using factorial.'};
      }
    }

  // if (isEmptyInput && isLeadingOperator) {
  //   return {
  //     allowed: false,
  //     message: 'Please enter a number before using ×, /, factorial or exponent operators.',
  //   };
  // }

  //"Logic: Do not display same operator twice in a row"
  // if((newValue === lastChar && (isOperator(lastChar) || decimal.includes(lastChar) || root === lastChar))){
  //   return {allowed: false, message: 'Message: Same operator twice in a row is not allowed'};
  // }

  const isSameChar = newValue === lastChar;

  if (isSameChar) {
    if (isOperator(lastChar)) {
      return { allowed: false, message: 'Same operator cannot be used twice in a row.' };
    }

    if (lastChar === decimal) {
      return { allowed: false, message: 'Decimal point cannot be used twice in a row.' };
    }

    if (lastChar === root) {
      return { allowed: false, message: 'Root symbol cannot be used twice in a row.' };
    }
    if (lastChar === percent) {
      return { allowed: false, message: 'Percent symbol cannot be used twice in a row.' };
    }
  }

  if (isSameChar) {
    if (lastChar === pi) {
      return { allowed: false, message: 'PI symbol cannot be used twice in a row.' };
    }
    if (lastChar === E) {
      return { allowed: false, message: 'e symbol cannot be used twice in a row.' };
    }
  }

  //Do not allow division by zero
  if (lastChar === divideBy && (newValue === 0 || newValue === '0')) {
    return { allowed: false, message: 'Division by zero is not allowed.' };
  }
  
  if (greaterPrevToken?.value === logFunctions.log && currentToken?.type === 'parenOpen' && nextToken?.type === 'parenClose' && isOperator(newValue)) {
    return { allowed: false, message: 'Operators are not allowed at the start of logarithms.' };
  }

  if (currentToken?.type === 'number' && (newValue.includes(expBox) && newValue.includes(root))) {
    return { allowed: false, message: 'Please enter an operator first before using nth root.' };
  }

  // if (greaterPrevToken?.value === logFunctions.log && currentToken?.type === 'parenOpen' && nextToken?.type === 'parenClose' && (newValue.includes(combinatorics.combination) || newValue.includes(combinatorics.permutation))) {
  //   return { allowed: false, message: 'Combination & Permutation are not allowed inside logarithms.' };
  // }

  if ((prevToken?.value === logFunctions.log || prevToken?.value === logFunctions.ln) && currentToken.type === 'parenOpen' && nextToken.type === 'parenClose' && isOperator(newValue)) {
    return { allowed: false, message: 'Operators are not allowed at the start of logarithms.' };
  }

  if ((currentToken?.type === 'supAndSub') && (newValue.includes(combinatorics.combination) || newValue.includes(combinatorics.permutation))) {
    return { allowed: false, message: 'Please enter an operator before using combinatorics.' };
  }

  if (currentToken?.type === 'supAndSub' && newValue.includes(root)) {
    return { allowed: false, message: 'Please enter an operator before using root operator.' };
  }

  // if ((prevToken?.value === logFunctions.log || prevToken?.value === logFunctions.ln) && currentToken.type === 'parenOpen' && nextToken.type === 'parenClose' && (newValue.includes(combinatorics.combination) || newValue.includes(combinatorics.permutation))) {
  //   return { allowed: false, message: 'Combination & Permutation are not allowed inside logarithms.' };
  // }
  
  if (lastChar === parenOpen && nextChar === parenClose && (newValue === 'left-arrow' || newValue === 'right-arrow')) {
    return { allowed: false, message: 'Arrow keys not allowed in empty brackets.' };
  }

  if (greaterLastChar === parenOpen && operators.includes(lastChar) && nextChar === parenClose && (newValue === 'left-arrow' || newValue === 'right-arrow')) {
    return { allowed: false, message: 'Please enter valid numbers inside brackets.' };
  }

  if (nextChar === expBox && (newValue === 'left-arrow' || newValue === 'right-arrow')) {
    return { allowed: false, message: 'Arrow keys not allowed before filling exponent box.' };
  }
 
  if (nextChar === expBox && (/[^0-9]/.test(newValue))) {
    return { allowed: false, message: 'Only numbers are allowed to fill exponent box.' };
  }

  if ((nextChar === combinatorics.combination || nextChar === combinatorics.permutation) && isOperator(newValue)){
    return { allowed: false, message: 'Operators not allowed inside Combination & Permutation.' };
  }
  //Logic: After an operator, . is permitted once because it can precede a number (Group A: Order 1)
  // if(isOperator(lastChar) && newValue === decimal){
  //   return currentInput + newValue;
  // }

  //Logic: Prevent multiple decimals in the same number
  // if(newValue === decimal && currentInput !== '' && !(currentInput === 'Invalid Input') && lastChar !== ')'){
  //   let filteredNumberArray = currentInput.split(regex);
  //   let lastElementOfArray = filteredNumberArray[filteredNumberArray.length - 1];
  //   if(!lastElementOfArray.includes(decimal)){
  //     return currentInput + newValue;
  //   }
  //   else{
  //     return null;
  //   }
  // }
  if (newValue === decimal && currentInput?.length && lastChar !== ')') {
    // const numbers = currentInput.split(regex);
    const numbers = currentInput.split(regex);
    const lastNumber = numbers[numbers.length - 1];

    if (lastNumber.includes(decimal)) {
      return {
        allowed: false,
        message: 'Multiple decimals in the same number are not allowed.'
      };
    }
  }

  //Do not allow opeators after decimal
  if(lastChar === decimal && operators.includes(newValue)){
    return {
      allowed: false,
      message: 'Operators are not allowed after decimal.'
    };
  }

  //"Logic: Do not display operators side by side, replace with the new one" (Group A: Order 2)
  // but, if the operators are *, /, root then don't replace
  if(isOperator(lastChar) && isOperator(newValue)){
    // if(['*','/', root].includes(newValue)){
    //   return false;
    // }
    // return currentInput.slice(0, -1) + newValue;
    return {allowed: false, action: 'replace'};
  }

  //Do not display percent when lastChar is not number
  const isLastCharNotNumber = !/[0-9]/.test(lastChar);
  if (isLastCharNotNumber && newValue === percent) {
    return {
      allowed: false,
      message: 'Please enter a number before using percent.',
    };
  }
  if (isLastCharNotNumber && newValue === factorial) {
    return {
      allowed: false,
      message: 'Please enter a number before using factorial.',
    };
  }

  //after a root, operators are not allowed
  if(lastChar === root && isOperator(newValue)){
    return {
      allowed: false, 
      message: 'Operators are not allowed after root',
    };
  }

  //when input value is only +/-/. then don't allow root to display
  const invalidRootStart = [plus, minus, decimal];

  if (currentInput.length === 1 && invalidRootStart.includes(lastChar) && newValue === root) {
    return {
      allowed: false,
      message: 'Root cannot be entered after a single +, -, or decimal.'
    };
  }

  //"Logic: After an operator display further, if the input is a number"
  // if(isOperator(lastChar) && !isOperator(newValue)){
  //   return currentInput + newValue;
  // }

  //when input value is 'Invalid Input', do nothing instead of AC button
  // if(currentInput === 'Invalid Input'){
  //   return null;
  // }

  // if(!(operators.includes(lastChar) || root === lastChar || decimal === lastChar) && newValue.includes("□")){
  //   return true;
  // }

  //Do not allow exponet operators if lastChar is not number
  if(isLastCharNotNumber && newValue.includes("x")){
    return {
      allowed: false, 
      message: 'Please enter a number before using exponent.',
    };
  }

  // if((newValue === '<' || newValue === '>') && currentInput == ''){
  //   return {allowed: false, message: 'Message: arrow keys are disable when input field is empty'};
  // }
  // const afterOperatorAllowed = [parenClose, factorial, pi, E];
  // const superscriptRegex = new RegExp(`^[${superscriptChars}]$`);
  // const subscriptRegex = new RegExp(`^[${subscriptChars}]$`);
  // if ((afterOperatorAllowed.includes(lastChar) || superscriptRegex.test(lastChar) || subscriptRegex.test(lastChar)) && !isOperator(newValue)) {
  //   return {
  //     allowed: false, 
  //     message: 'Please enter an operator to continue the calculation.',
  //   };
  // }

  //Update input value based on user button click
  return {allowed: true};
}

//this function is about validate and allow for calculation
export function validateForEvaluation(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];

  //Logic: if last character is an operator/decimal then do nothing
  // if(newValue === '=' && currentInput !== '' && (isOperator(lastChar) || decimal.includes(lastChar))){
  //   return null;
  // }

  //Logic: when input value is empty, then do nothing
  // if(newValue === '=' && currentInput == ''){
  //   return null;
  // }

  if(newValue === '=' && (currentInput === '' || isOperator(lastChar) || lastChar === decimal)){
    return {allowed: false, message: 'Message: Calculation is not allowed if input is empty or last character is operator or decimal'};
  }

  //proceed for calculation
  return {allowed: true};
}