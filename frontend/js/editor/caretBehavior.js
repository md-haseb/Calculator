import { getTokens } from '../core/tokenHelpers.js';
import { classifyButton } from '../core/classifyBtn.js';
import { percent, factorial } from '../core/constants.js';

import {
  getCurrTokenIndexFromCaret,
  getPrevTokenIndexFromCaret,
  getGreaterPrevTokenIndexFromCaret,
  getNextTokenIndexFromCaret,
  getGreaterNextTokenIndexFromCaret,
  getCaretAfterToken,
  isAtEndOfCurrentToken
} from './caretMap.js';

import { normalizeTokens } from '../core/normalizeTokens.js';





/**
 * Set of token types that should trigger deletion from the start of the token.
 *
 * When the caret is at the start of one of these tokens, the deletion logic
 * considers removing the entire token rather than a single character.
 *
 * Includes:
 * - 'parenOpen' / 'parenClose' : Parentheses
 * - 'operator'                : Arithmetic operators (+, -, ×, ÷, etc.)
 * - 'constant'                : Constants like π or e
 * - 'singleRoot'              : Square root (√)
 * - 'nthRoot'                 : nth root (e.g., ³√, ⁵√)
 */

const deleteStartTokens = new Set([
  'parenOpen',
  'parenClose',
  'operator',
  'constant',
  'singleRoot',
  'nthRoot'
]);






/**
 * Set of token types that can be targeted for deletion.
 *
 * These represent tokens that hold numeric or structural value, including:
 * - Numbers (integer, decimal, with π or e)
 * - Constants (π, e)
 * - Parentheses
 * - Superscript/subscript combinations
 * - Standalone superscripts
 *
 * This set helps determine the token that will be deleted when the user
 * presses the delete/backspace key.
 */

const deleteTargetTypes = new Set([
  'number',
  'numberWithDecimal',
  'numWithPi',
  'numWithE',
  'constant',
  'parenOpen',
  'parenClose',
  'supAndSub',
  'superscriptValue'
]);






/**
 * Finds the token that should be deleted based on caret position and input context.
 *
 * Handles semantic deletion rules:
 * 1. Structural tokens (like parentheses) may trigger backward jumps.
 * 2. Single-digit numbers or superscripts after an operator may delete the previous token.
 * 3. Special tokens like %, !, or subscripted combinatorics are also considered.
 *
 * @param {Array<Object>} normalizedToken - Array of normalized tokens.
 * @param {Map<number, Object>} map - Map of caret positions to tokens.
 * @param {number} caretPos - Current caret position in the input.
 * @returns {number} Index of the token to delete in `normalizedToken`.
 */

export function findDeleteTargetToken(normalizedToken, map, caretPos) {
  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const prevTokenIndex = getPrevTokenIndexFromCaret(map, caretPos);
  const prevToken = prevTokenIndex === -1 ? null : normalizedToken[prevTokenIndex];

  let targetTokenIndex = currTokenIndex;

  if(deleteStartTokens.has(currentToken?.type) || 
  ((currentToken?.type === 'number' || currentToken?.type === 'superscriptValue') && String(currentToken?.value).length == 1 && prevToken?.type === 'operator')) {
    for(let i = currTokenIndex - 1; i >= 0; i--) {
      if((currentToken?.type === 'parenClose') && (normalizedToken[i]?.type === 'parenClose')) {
        continue;
      }
      if(deleteTargetTypes.has(normalizedToken[i]?.type) || normalizedToken[i]?.value === percent || normalizedToken[i]?.value === factorial || (normalizedToken[i]?.type === 'subscriptValue' && normalizedToken[i - 1]?.type === 'combAndPerm')) {
        targetTokenIndex = i;
        return targetTokenIndex;
      }
    }
  }
  return targetTokenIndex;
}





/**
 * Computes the new caret position after performing a delete operation.
 *
 * Handles:
 * 1. Special structural deletes (like removing closing parentheses).
 * 2. Semantic delete jumps to previous token when appropriate.
 * 3. Default fallback to a single-character backspace behavior.
 *
 * @param {string} inputText - Current input string.
 * @param {Map<number, Object>} map - Map of caret positions to tokens.
 * @param {HTMLElement} btn - Button that was pressed (delete/backspace).
 * @param {number} caretPos - Current caret position.
 * @returns {number} New caret position after deletion.
 */

export function getCaretAfterDelete(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const newNormalizedToken = normalizeTokens(tokensObj);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : newNormalizedToken[currTokenIndex];

  const { type } = classifyButton(btn);

  if(type === 'delete') {
    const targetTokenIndex = findDeleteTargetToken(newNormalizedToken, map, caretPos);

    // 1. Special structural deletes
    if(currentToken?.type === 'parenClose') {
      return Math.max(caretPos - 2, 0);
    }
    // 2. Semantic delete jump
    if(targetTokenIndex !== currTokenIndex) {
      return getCaretAfterToken(map, targetTokenIndex);
    }
    // 3. Fallback: single char delete
    return Math.max(caretPos - 1, 0);
  }
}




// Caret movement is button-driven.
// Structural buttons (box/root/etc) intentionally keep caret at current token boundary.
// Token atomicity is enforced at the button level, not token level.

/**
 * Determines how the caret should move when the left arrow (backward) button is pressed.
 *
 * This function analyzes the current input, the normalized tokens, and the caret position
 * to decide whether the caret should:
 * 1. Move one character left inside the current token ('char').
 * 2. Jump to the prev token boundary ('prev').
 * 3. Jump over certain structures like functions/operators ('greaterPrev').
 *
 * Movement rules:
 * - Numeric and value tokens (numbers, decimals, superscripts, subscripts, numWithPi/E)
 *   allow character-level movement.
 * - Structural tokens like parentheses or subscripted values after functions
 *   cause the caret to jump to a semantically meaningful position.
 *
 * @param {string} inputText - Current input string.
 * @param {Map<number,Object>} map - Mapping of caret positions to token objects.
 * @param {HTMLElement} btn - Button object representing the input action.
 * @param {number} caretPos - Current caret position in the input.
 * @returns {{move: string}} Object indicating movement type: 'char', 'prev', or 'greaterPrev'.
 */

function shouldMoveToPrevToken(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const prevTokenIndex = getPrevTokenIndexFromCaret(map, caretPos);
  const prevToken = prevTokenIndex === -1 ? null : normalizedToken[prevTokenIndex];

  // const greaterPrevTokenIndex = getGreaterPrevTokenIndexFromCaret(map, caretPos);
  // const greaterPrevToken = greaterPrevTokenIndex === -1 ? null : normalizedToken[greaterPrevTokenIndex];

  const { type } = classifyButton(btn);

  // 🔹 Move inside token (char-left)
  const shouldMoveCharLeft =
    type === 'leftArrow' && (currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal' || currentToken?.type === 'numWithPi' || currentToken?.type === 'numWithE' || currentToken?.type === 'supAndSub' || currentToken?.type === 'superscriptValue' || currentToken?.type === 'subscriptValue');


  // 🔹 Skip back over function/operator
  const shouldMoveToGreaterPrev =
    type === 'leftArrow' &&
    (currentToken?.type === 'parenOpen' && prevToken?.type === 'function') || 
    (currentToken?.type === 'subscriptValue' && prevToken?.type === 'function');

  if (shouldMoveCharLeft) {
    return { move: 'char' };
  }

  if (shouldMoveToGreaterPrev) {
    return { move: 'greaterPrev' };
  }

  return { move: 'prev' };
}






/**
 * Determines how the caret should move when the right arrow (forward) button is pressed.
 *
 * This function analyzes the current input, normalized tokens, and caret position
 * to decide whether the caret should:
 * 1. Move one character right inside the current token ('char').
 * 2. Stay at the current token boundary for structural buttons ('current').
 * 3. Jump to the next token boundary ('next').
 * 4. Jump over a larger structural block like function with parentheses ('greaterNext').
 *
 * Movement rules:
 * - Numeric tokens, decimals, and superscript/subscript values allow character-level movement.
 * - Buttons like log/base/root/combinatorics keep the caret on the current token until the operation completes.
 * - Functions followed by parentheses trigger a greater-jump movement to the opening parenthesis.
 *
 * @param {string} inputText - Current input string.
 * @param {Map<number,Object>} map - Mapping of caret positions to token objects.
 * @param {HTMLElement} btn - Button object representing the input action.
 * @param {number} caretPos - Current caret position in the input.
 * @returns {{move: string}} Object indicating movement type: 'char', 'current', 'next', or 'greaterNext'.
 */

function shouldMoveToNextToken(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];
  
  const nextTokenIndex = getNextTokenIndexFromCaret(map, caretPos);
  const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  const greaterNextTokenIndex = getGreaterNextTokenIndexFromCaret(map, caretPos);
  const greaterNextToken = greaterNextTokenIndex === -1 ? null : normalizedToken[greaterNextTokenIndex];

  const { type } = classifyButton(btn);

  const shouldMoveCharRight =
  (type === 'number' || type === 'decimal') && 
    (currentToken?.type === 'number' || 
    currentToken?.type === 'superscriptValue' || 
    currentToken?.type === 'supAndSub' || 
    currentToken?.type === 'subscriptValue' || 
    currentToken?.type === 'numberWithDecimal' || 
    nextToken?.type === 'superscriptValue' || 
    nextToken?.type === 'subscriptValue' || 
    nextToken?.type === 'number' || 
    nextToken?.type === 'numberWithDecimal') || 
  type === 'rightArrow' && (
    (currentToken === null && nextToken?.type === 'number') || 
    (
      (currentToken?.type === 'number' ||
      currentToken?.type === 'numberWithDecimal' || 
      currentToken?.type === 'superscriptValue' || 
      currentToken?.type === 'subscriptValue' || 
      currentToken?.type === 'supAndSub') &&
      !isAtEndOfCurrentToken(map, caretPos)
    ) ||

    nextToken?.type === 'numberWithDecimal' ||

    nextToken?.type === 'superscriptValue' || 

    nextToken?.type === 'subscriptValue' || 

    nextToken?.type === 'supAndSub' || 

    (currentToken?.type === 'parenOpen' &&
     nextToken?.type === 'number') ||

    (
      (currentToken?.type === 'numWithPi' ||
       currentToken?.type === 'numWithE') &&
      !isAtEndOfCurrentToken(map, caretPos)
    ) ||

    (
      nextToken?.type === 'numWithPi' ||
      nextToken?.type === 'numWithE' ||
      nextToken?.type === 'constant'
    ) ||

    (currentToken?.type === 'operator' &&
     nextToken?.type === 'number') ||

    (currentToken?.type === 'singleRoot' &&
     nextToken?.type === 'number')
  );


  const shouldStayOnCurrentToken =

  (type === 'logWithBox' && currentToken?.type === 'function') ||

  (type === 'baseWithSupers' && currentToken?.type === 'supAndSub') ||

  (type === 'pi' && currentToken?.type === 'numWithPi') ||

  (type === 'E' && currentToken?.type === 'numWithE') ||

  ((type === 'plus' || type === 'minus' || type === 'multiply' || type === 'multiplicationDot' || type === 'divide') && currentToken?.type === 'operator') || 

  type === 'baseWithBox' ||
  type === 'boxWithRoot' ||
  type === 'combOrPerm';


  const shouldMoveToGreaterNext =
  (type === 'rightArrow' &&
    (currentToken === null || currentToken?.type === 'operator') &&
    nextToken?.type === 'function' && greaterNextToken?.type === 'parenOpen') ||
  type === 'function';


  if (shouldMoveCharRight) {
    return { move: 'char' }; 
  }

  if (shouldStayOnCurrentToken) {
    return { move: 'current' };
  }


  if (shouldMoveToGreaterNext) {
    return { move: 'greaterNext' };
  }

  return { move: 'next' };
}






/**
 * Computes the new caret position after an insertion or button press.
 *
 * This function determines the appropriate caret movement based on the type of button pressed,
 * current input state, and the normalized token map.
 *
 * Movement behavior:
 * - Left arrow: uses shouldMoveToPrevToken to determine char-level or token-level movement.
 * - Right arrow or other insertions: uses shouldMoveToNextToken to determine char-level, current-token, 
 *   next-token, or greater-next-token movement.
 *
 * The function ensures that the caret does not exceed the input bounds and accounts for
 * semantic and structural boundaries (functions, roots, parentheses, and combinatorial tokens).
 *
 * @param {string} inputText - Current input string.
 * @param {Map<number,Object>} map - Mapping of caret positions to token objects.
 * @param {HTMLElement} btn - Button object representing the input action.
 * @param {number} caretPos - Current caret position in the input.
 * @returns {number} New caret position after the insertion or movement.
 */

export function getCaretAfterInsertion (inputText, map, btn, caretPos) {
  const { type } = classifyButton(btn);

  if (type === 'leftArrow') {
    const moveType = shouldMoveToPrevToken(inputText, map, btn, caretPos).move;

    if (moveType === 'char') {
      return Math.max(caretPos - 1, 0);
    }

    let targetTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);

    if (moveType === 'prev') targetTokenIndex -= 1;
    if (moveType === 'greaterPrev') targetTokenIndex -= 2;

    return getCaretAfterToken(map, targetTokenIndex);
  }


  const currentTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const moveType = shouldMoveToNextToken(inputText, map, btn, caretPos).move;

  let targetTokenIndex = currentTokenIndex;

  if (moveType === 'char') {
    return Math.min(caretPos + 1, map.length);
  }
  if (moveType === 'current') {
    targetTokenIndex = currentTokenIndex;
  }
  if (moveType === 'next') {
    targetTokenIndex += 1;
  }
  if (moveType === 'greaterNext') {
    targetTokenIndex += 2;
  }

  const newCaretPosition = getCaretAfterToken(map, targetTokenIndex);
  return newCaretPosition;
}