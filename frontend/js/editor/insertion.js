import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";
import {showExponentBox, showExponent, showIndices, insertAt, replaceAt} from "./insertionHelpers.js";
import {classifyButtonValue} from '../core/classifyBtn.js';
import {formatTokensForDisplay} from '../ui/formatDisplay.js';
import {getCaretAfterInsertion} from './caretBehavior.js';
import { multiplicationDot, multiplySymbol } from "../core/constants.js";


/**
 * Inserts a new value into the current input string at the caret position.
 * Handles exponent box, exponents, indices, brackets, functions, and normal characters.
 * @param {string} currentInput - Current input string from display.
 * @param {number} caretPosition - Current caret position in the input.
 * @param {string} newValue - Value to insert (number, operator, function, or special symbol).
 * @returns {{newInput: string, newCaret: number}} Updated input string and new caret position.
 */
export function insertValue(currentInput, caretPosition, btn, newValue) {
  const clickedValue = classifyButtonValue(newValue);
  const typesWithBox = ['logWithBox', 'baseWithBox', 'boxWithRoot', 'combOrPerm'];

  const tokens = getTokens(currentInput);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  const nextToken = getNextToken(tokens, currentToken);
  const greaterNextToken = getNextToken(tokens, nextToken);
  console.log(tokens);
  console.log(currentToken);
  console.log(prevToken);
  console.log(nextToken);
  console.log(greaterNextToken);

  // function applyExponentBox(value){
  //   console.log(value);
  //   const newInput = showExponentBox(currentInput, caretPosition, value);
  //   const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  //   console.log(newInput);
  //   return {
  //     newInput,
  //     newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, value, caretPosition),
  //   };
  // }

  function applyExponentBox(value){
    const newInput = showExponentBox(currentInput, caretPosition, value);
    const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
    return {
      newInput,
      newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    };
  }

  function applyExponent(value) {
    const newInput = showExponent(currentInput, caretPosition, value, currentToken, nextToken, greaterNextToken);
    const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
    return {
      newInput,
      newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    };
  }

  function applyIndices(value) {
    const newInput = showIndices(currentInput, caretPosition, value, nextToken, greaterNextToken);
    const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
    return {
      newInput,
      newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    };
  }

  function insertWithCaret(value) {
    console.log('hello');
    if (value === multiplySymbol) {
      value = multiplicationDot;
    }
    console.log(value);
    console.log(currentInput, caretPosition, value);
    const newInput = insertAt(currentInput, caretPosition, value);
    console.log(newInput);
    const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
    return {
      newInput,
      newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    };
  }
  
  // Types with box
  if (typesWithBox.includes(clickedValue.type)) return applyExponentBox(clickedValue.value);

  // Base with superscript
  if (clickedValue.type === 'baseWithSupers') return applyExponent(clickedValue.value);

  // exponent and indices handling
  const exponentTokenTypes = ['supAndSub', 'superscriptValue'];
  const nthRootToken = 'nthRoot';
  const boxNextTypes = ['singleRoot', 'combAndPerm'];
  const subscriptTokenTypes = ['subscriptValue'];
  console.log(clickedValue.type);
  function isExponentCase(currentToken, nextToken, caretPosition) {
    return (
      (exponentTokenTypes.includes(currentToken?.type) && clickedValue.type === 'number') ||
      (nextToken?.type === 'box' && (greaterNextToken?.type === 'singleRoot' || greaterNextToken?.type === 'combAndPerm')) ||
      (currentToken.type === nthRootToken && caretPosition < currentToken.end) ||
      ((currentToken.type === 'number' || currentToken.type === 'numberWithDecimal') && nextToken?.type === 'box') ||
      (currentToken.type === 'box' && boxNextTypes.includes(nextToken?.type))
    );
  }

  function isIndicesCase(currentToken, nextToken){
    return (
      (subscriptTokenTypes.includes(currentToken.type) && clickedValue.type === 'number') ||
      (currentToken.type === 'function' && nextToken?.type === 'box') ||
      (currentToken.type === 'combAndPerm' && nextToken?.type === 'box') || 
      (currentToken.type === 'combAndPerm' && nextToken?.type === 'subscriptValue') || 
      (currentToken?.type === 'function' && nextToken?.type === 'subscriptValue')
    );
  }

  if (currentToken) {
    if (isExponentCase(currentToken, nextToken, caretPosition)) {
      return applyExponent(clickedValue.value);
    }

    if (isIndicesCase(currentToken, nextToken)) {
       return applyIndices(clickedValue.value);
    }
  }

  // Brackets
  if (clickedValue.type === 'parentheses') return insertWithCaret(clickedValue.value);

  // Default insertion
  return insertWithCaret(clickedValue.value);


  // if (typesWithBox.includes(clickedValue.type)) {
  //     return {
  //       newInput: showExponentBox(currentInput, caretPosition, clickedValue.value),
  //       newCaret: getCaretAfterInsertion(clickedValue.value, caretPosition),
  //     };
  // }

  // if(clickedValue.type === 'baseWithSupers'){
  //   return{
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }
  
  // Case 2: filling exponent and indices (subscript)
  // if(currentToken?.type === 'function' && nextToken?.type === 'box'){
  //   return {
  //     newInput: showIndices(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if ((currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal') && nextToken?.type === 'box') {
  //   return {
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if(currentToken?.type === 'combAndPerm' && nextToken?.type === 'box'){
  //   return {
  //     newInput: showIndices(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if(currentToken?.type === 'box' && nextToken?.type === 'singleRoot'){ 
  //   return {
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if(currentToken?.type === 'box' && nextToken?.type === 'combAndPerm'){ 
  //   return {
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // Case 3: appending to superscript and subscript
  // if (currentToken?.type === 'nthRoot' && caretPosition < currentToken?.end) {
  //   return {
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if (currentToken?.type === 'supAndSub') {
  //   return {
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if(currentToken?.type === 'superscriptValue'){
  //   return {
  //     newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(newValue, caretPosition),
  //   };
  // }

  // if(currentToken?.type === 'subscriptValue'){
  //   return {
  //     newInput: showIndices(currentInput, caretPosition, clickedValue.value, currentToken, nextToken),
  //     newCaret: getCaretAfterInsertion(clickedValue.value, caretPosition),
  //   };
  // }



  // Case 4: bracket handling → place caret inside
  // if (clickedValue.type === 'parentheses') {
  //   return {
  //     newInput: insertAt(currentInput, caretPosition, clickedValue.value),
  //     newCaret: getCaretAfterInsertion(clickedValue.value, caretPosition), // caret is inside the brackets
  //   };
  // }

  // // Default case: normal insertion
  // return {
  //   newInput: insertAt(currentInput, caretPosition, clickedValue.value),
  //   newCaret: getCaretAfterInsertion(clickedValue.value, caretPosition),
  // };
}


/**
 * Replaces the last character in the input with a new operator.
 * @param {string} currentInput - Current input string.
 * @param {string} newValue - New operator to replace the last one.
 * @returns {string} Updated input string with operator replaced.
 */
export function replaceOperator(currentInput, caretPosition, rawValue) {
  const replacement = classifyButtonValue(rawValue);

  const tokens = getTokens(currentInput);
  const currentToken = getTokenAtCaret(tokens, caretPosition);

  const start = caretPosition - currentToken.value.length;
  const length = currentToken.value.length;
  
  return {
    newInput: replaceAt(currentInput, start, length, replacement.value),
    newCaret: getCaretAfterInsertion(replacement.value, caretPosition),
  };
}