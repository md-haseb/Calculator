import {getTokens, tokenValues, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";
import {showExponentBox, showExponent, showIndices, insertAt, replaceAt} from "./insertionHelpers.js";
import {classifyButtonValue} from '../core/classifyBtn.js';
import {formatTokensForDisplay} from '../ui/formatDisplay.js';
import {getCaretAfterInsertion} from './caretBehavior.js';
import { multiplicationDot, multiplySymbol } from "../core/constants.js";
import { normalizeTokens } from '../core/normalizeTokens.js';
import { getCurrTokenIndexFromCaret, getPrevTokenIndexFromCaret } from './caretMap.js';




/**
 * Inserts a new value into the current mathematical input string at the caret position,
 * while handling special cases like exponents, indices, boxes, functions, brackets, and normal characters.
 *
 * The function determines the context of the caret and nearby tokens to decide whether the
 * inserted value should trigger:
 *  - Exponent box insertion (e.g., log or power boxes)
 *  - Superscript/exponent insertion
 *  - Subscript/indices insertion
 *  - Normal character insertion
 *
 * @param {string} currentInput - The current input string from the display.
 * @param {number} caretPosition - Current caret (cursor) position in the input string.
 * @param {string} btn - Button type/value that triggered the insertion (used for caret logic).
 * @param {string} newValue - The value to insert (number, operator, function, or special symbol).
 * @returns {{newInput: string, newCaret: number, showMsg?: boolean}} 
 *          Updated input string, the new caret position, and optional display flags.
 *
 * @remarks
 * The function uses tokenization and normalization to analyze the input, identifies the 
 * current, previous, and next tokens around the caret, and chooses the appropriate insertion 
 * method based on the context.
 */

export function insertValue(currentInput, caretPosition, btn, newValue) {
  const clickedValue = classifyButtonValue(newValue);
  const typesWithBox = ['logWithBox', 'baseWithBox', 'boxWithRoot', 'combOrPerm'];

  const tokens = getTokens(currentInput);
  const tokensValue = tokenValues(tokens);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  const nextToken = getNextToken(tokens, currentToken);
  const greaterNextToken = getNextToken(tokens, nextToken);
  console.log(tokens);
  console.log(currentToken);
  console.log(prevToken);
  console.log(nextToken);
  console.log(greaterNextToken);

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
    console.log(inputMapForCaretMove);
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
}





/**
 * Replaces the operator at the current caret position based on the previous token.
 *
 * This function is invoked only after input validation. It assumes that a valid
 * previous token exists at the caret position and uses token boundaries to
 * determine the replacement range, avoiding manual index calculations.
 *
 * @param {string} currentInput - The current input expression.
 * @param {Object} map - Token-to-input position mapping.
 * @param {number} caretPosition - Current caret position in the input.
 * @param {Object} btn - The button that triggered the replacement.
 * @param {string} newValue - The operator value to insert.
 * @returns {{ newInput: string, newCaret: number }} Updated input and caret position.
 */

export function replaceOperator(currentInput, map, caretPosition, btn, newValue) {
  if (newValue === multiplySymbol) {
    newValue = multiplicationDot;
  }
  const replacement = classifyButtonValue(newValue);

  const tokensObj = getTokens(currentInput);
  const normalizedToken = normalizeTokens(tokensObj);

  const prevTokenIndex = getPrevTokenIndexFromCaret(map, caretPosition);
  const prevToken = prevTokenIndex === -1 ? null : normalizedToken[prevTokenIndex];

  // Called only after input validation; prevToken is guaranteed
  const replaceStartIndex = prevToken.end;
  const replaceLength = caretPosition - prevToken.end;

  const newInput = replaceAt(currentInput, replaceStartIndex, replaceLength, replacement.value);

  return {
    newInput,
    newCaret: getCaretAfterInsertion(newInput, map, btn, caretPosition)
  };
}