import { insertValue, replaceOperator } from "./insertion.js";
import { tokenize } from "../core/tokenize.js";
import { getTokens, getTokenAtCaret, getPrevToken, getNextToken } from "../core/tokenHelpers.js";
import { validateForDisplay, validateForEvaluation } from "../core/validation.js";
import { calculate } from "../core/calculation.js";
import { insertAt } from "../editor/insertionHelpers.js";
// import { showIndices, insertAt, makeCombPermTemplate } from "../editor/insertionHelpers.js";
import { combinatorics, expBox, decimal, minus, operators, pi, E } from "../core/constants.js";
import { formatTokensForDisplay } from "../ui/formatDisplay.js";
import { normalizeTokens } from '../core/normalizeTokens.js';
import { getCurrTokenIndexFromCaret, getNextTokenIndexFromCaret } from './caretMap.js';
import { getCaretAfterDelete, getCaretAfterInsertion, findDeleteTargetToken } from './caretBehavior.js';




/**
 * Adjusts the caret position when the user clicks inside the input.
 *
 * Ensures semantic caret placement by snapping the caret to meaningful
 * token boundaries instead of allowing it to remain inside atomic tokens
 * such as functions or operators.
 *
 * - Clicking on a function token places the caret before the function.
 * - Clicking on an operator places the caret after the operator.
 * - Other tokens preserve the original click position.
 *
 * @param {HTMLElement} input - The editable input element.
 * @param {Range} clickedRange - The selection range created by the click.
 * @returns {number} The normalized caret offset to apply.
 */

export function handleInputClick(input, clickedRange){
  const tokens = tokenize(input.textContent);
  const currentToken = getTokenAtCaret(tokens, clickedRange.offset);
  const nextToken = getNextToken(tokens, currentToken);

  let finalOffset = clickedRange.offset;

  if (currentToken?.type === 'function') {
    finalOffset = currentToken.start;
  }
  if (currentToken?.type === 'operator') {
    finalOffset = nextToken?.start;
  }

  return finalOffset;
}





/**
 * Handles the "AC" (All Clear) action.
 *
 * Resets the input state by clearing the expression,
 * moving the caret to the start, and triggering
 * any associated UI feedback (e.g. messages or hints).
 *
 * @returns {{ newInput: string, newCaret: number, showMsg: boolean }}
 * An object describing the updated input state.
 */

export function handleAC(){
  return{
    newInput: '',
    newCaret: 0, 
    showMsg: true,
  }
}






/**
 * Handles delete (backspace) behavior for the calculator input.
 *
 * This function performs token-aware deletion instead of raw character deletion.
 * It analyzes the current caret position, resolves the active and neighboring tokens,
 * determines the correct deletion target, and computes the appropriate delete range
 * based on semantic rules (numbers, operators, functions, parentheses, superscripts, etc.).
 *
 * @param {string} inputText - Current input expression.
 * @param {number} caretPosition - Current caret index in the input.
 * @param {HTMLElement} btn - The delete button element that triggered the action.
 *
 * @returns {{
 *   newInput: string,
 *   newCaret: number,
 *   showMsg: boolean
 * }} Updated input state after deletion.
 */

export function handleDelete(inputText, caretPosition, btn){
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);
  
  const { map: inputMapForCaretMove } = formatTokensForDisplay(inputText);
  
  const currTokenIndex = getCurrTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const nextTokenIndex = getNextTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);

  const { start, end } = getDeleteRange(
    normalizedToken,
    tokenInd,
    currentToken,
    nextToken,
    caretPosition
  );

  const newInput =
    inputText.slice(0, start) +
    inputText.slice(end);

  const newCaret = start;

  return {
    newInput,
    newCaret,
    showMsg: true,
  };
}






/**
 * Computes the character range to delete based on token structure and caret position.
 *
 * This function encapsulates all delete semantics, including:
 * - Single-character deletion inside value tokens
 * - Token-boundary-aware deletion
 * - Special handling for parentheses, operators, and superscript/subscript values
 * - Fallback behavior when no valid token exists
 *
 * The returned range is used directly to slice the input string.
 *
 * @param {Array<Object>} tokens - Normalized list of tokens.
 * @param {number} targetTokenIndex - Index of the token selected for deletion.
 * @param {Object|null} currToken - Token at the current caret position.
 * @param {Object|null} nextToken - Token immediately following the caret.
 * @param {number} caretPos - Current caret index.
 *
 * @returns {{ start: number, end: number }} Character range to delete.
 */

function getDeleteRange(tokens, targetTokenIndex, currToken, nextToken, caretPos) {
  const token = tokens[targetTokenIndex];

  // No valid token: fallback to single-character deletion
  if (!token) {
    return {
      start: Math.max(caretPos - 1, 0),
      end: caretPos,
    };
  }

  // Mutate next operator token start/end to include adjacent spaces,
  // so deletion preserves operator spacing semantics
  if (nextToken?.type === 'operator') {
    const spaceLen = 1;
    nextToken.start -= spaceLen;
    nextToken.end += spaceLen;
  }

  // If caret is immediately after an opening parenthesis,
  // delete the enclosed value/function and collapse the structure
  if ((token.type === 'number' || token.type === 'parenClose' || token.type === 'supAndSub' || token.type === 'subscriptValue') && currToken?.type === 'parenOpen') {
    return {
      start: token.end,
      end: nextToken?.end ?? caretPos
    }
  }


  const valueTokenTypes = new Set([
    'number',
    'numberWithDecimal',
    'constant',
    'operator',
    'numWithPi',
    'numWithE',
    'superscriptValue',
    'subscriptValue',
    'supAndSub',
  ]);


  const isValueToken = valueTokenTypes.has(token.type);
  const isSpecialInlineValue =
    token.type === 'combAndPerm' ||
    token.value === decimal ||
    token.value === minus;

  const case1 =
    isValueToken && currToken.type === 'parenClose';

  const case2 =
    (isValueToken || isSpecialInlineValue) &&
    caretPos > token.start &&
    caretPos <= token.end;

  const case3 = (token.type === 'numWithPi' || token.type === 'numWithE') && 
    caretPos >= token.end;

  // Delete last character of value token before closing parenthesis
  if (case1) {
    return {
      start: token.end - 1,
      end: token.end,
    }
  }

  // Standard backspace behavior inside value tokens
  if (case2 || case3) {
    return {
      start: caretPos - 1,
      end: caretPos,
    }
  }

  // Default deletion: remove from the end of the target token up to the start of the next token or caret position
  return {
    start: token.end,
    end: nextToken?.start ?? caretPos
  };
}





/**
 * Handles insertion of a mathematical function into the input string.
 * Appends the function name followed by parentheses at the current caret position,
 * updates the input string, and calculates the new caret position.
 *
 * @param {string} value - The function name to insert (e.g., "sin", "cos").
 * @param {string} inputText - The current input string.
 * @param {Object} btn - The button object that triggered the insertion (used for caret logic).
 * @param {number} caretPosition - The current caret index in the input string.
 * @returns {Object} An object containing:
 *   - newInput: The updated input string with the function inserted.
 *   - newCaret: The updated caret position after insertion.
 *   - showMsg: Boolean indicating whether to show a message (always true here).
 */

export function handleFunctions(value, inputText, btn, caretPosition){
  const insertValue = `${value}()`;

  const newInput = insertAt(inputText, caretPosition, insertValue);
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}





/**
 * Handles the "=" button action by evaluating the current input expression.
 * Computes the result, updates the input string with the result, 
 * and places the caret at the end of the new input.
 *
 * @param {string} inputText - The current mathematical expression input.
 * @returns {Object} An object containing:
 *   - newInput: The evaluated result as a string.
 *   - newCaret: The caret position after insertion (set to end of result).
 *   - showMsg: Boolean indicating whether to show a message (always true here).
 */

export function handleEqual(inputText){
  const newInput = calculate(inputText);
    return{
      newInput,
      newCaret: newInput.length,
      showMsg: true,
    }
}





/**
 * Handles the left arrow button action by moving the caret appropriately.
 * Uses the current input and caret position to determine the new caret location 
 * according to token boundaries and input structure.
 *
 * @param {string} inputText - The current input string in the editor.
 * @param {number} caretPosition - The current caret index within the input.
 * @param {Object} btn - The button object representing the left arrow action.
 * @returns {Object} An object containing:
 *   - newInput: The (reformatted) input string (unchanged in this case).
 *   - newCaret: The updated caret position after the left arrow action.
 *   - showMsg: Boolean indicating whether to show a message (always true here).
 */

export function handleLeftArrow(inputText, caretPosition, btn){
  const newInput = formatTokensForDisplay(inputText).text;
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}





/**
 * Handles the right arrow button action by moving the caret appropriately.
 * Determines the new caret position based on the current input, token boundaries,
 * and the button action, ensuring correct navigation through numbers, operators,
 * functions, and other token types.
 *
 * @param {string} inputText - The current input string in the editor.
 * @param {number} caretPosition - The current caret index within the input.
 * @param {Object} btn - The button object representing the right arrow action.
 * @returns {Object} An object containing:
 *   - newInput: The (reformatted) input string (unchanged in this case).
 *   - newCaret: The updated caret position after the right arrow action.
 *   - showMsg: Boolean indicating whether to show a message (always true here).
 */

export function handleRightArrow(inputText, caretPosition, btn){
  const newInput = formatTokensForDisplay(inputText).text;
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}

