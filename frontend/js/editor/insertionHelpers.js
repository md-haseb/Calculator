import { normalToSuperscript, normalToSubscript, combinatorics, combinatoricsArr, logFunctionsArr, expBox, trigFunctions } from "../core/constants.js";
import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";
import {classifyButtonValue} from '../core/classifyBtn.js';
import {formatTokensForDisplay} from '../ui/formatDisplay.js';




/**
 * Inserts an exponent placeholder (□) or other special notation at the current caret position.
 *
 * This function handles different types of special inputs such as:
 * - `logWithBox` → inserts a logarithm with a subscript placeholder.
 * - `boxWithRoot` → inserts a superscript placeholder followed by a square root symbol.
 * - `combOrPerm` → inserts superscript/subscript placeholders for combinatorial expressions.
 * - Default → inserts a standalone superscript placeholder.
 *
 * @param {string} currentInput - The current input string in the editor.
 * @param {number} caretPos - The current position of the caret where the value should be inserted.
 * @param {string} newValue - The button value representing the type of exponent or special notation to insert.
 * @returns {string} - The updated input string with the placeholder or notation inserted at the caret position.
 */

export function showExponentBox(currentInput, caretPos, newValue) {
  const {type, value} = classifyButtonValue(newValue);
  let valueToInsert;

  console.log(type);
  switch (type) {
    case 'logWithBox':
      valueToInsert = `log<sub>□</sub>()`;
      break;
    case 'boxWithRoot':
      valueToInsert = `<sup>□</sup>√`;
      break;
    case 'combOrPerm':
      const combOrPermSymbol = filterOut_nAndr(value);
      valueToInsert = `<sup>□</sup>${combOrPermSymbol}<sub>□</sub>`;
      break;
    default:
      valueToInsert = `<sup>□</sup>`;
  }

  console.log(currentInput, caretPos, valueToInsert);
  return insertAt(currentInput, caretPos, valueToInsert);
}






/**
 * Applies a superscript (exponent) at the caret position in the input string.
 *
 * Handles insertion and replacement based on the current and surrounding tokens,
 * including:
 * - Replacing a placeholder box (□) with a superscript
 * - Extending or updating an existing superscript
 * - Handling combinatorial expressions (nCr / nPr)
 * - Handling roots and other special notations
 *
 * Takes into account HTML markup differences (e.g., <sub>) when calculating
 * visible length and replacement positions.
 *
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - Current caret position in the input.
 * @param {string} newValue - Raw value to convert into a superscript.
 * @param {Object} currentToken - Token at the caret position.
 * @param {Object} nextToken - Token immediately after the caret.
 * @param {Object} greaterNextToken - Lookahead token for contextual decisions.
 * @returns {string} Updated input string with the superscript applied.
 */

export function showExponent(currentInput, caretPos, newValue, currentToken, nextToken, greaterNextToken) {
  const {type, value} = classifyButtonValue(newValue);
  const supers = convertToSupers(value);
  const valueWithoutX = filterOut_baseX(supers);

  const boxLength = expBox.length;

  const nextCombOrPerm = nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation;

  const greaterNextCombOrPerm = greaterNextToken?.value === combinatorics.combination || greaterNextToken?.value === combinatorics.permutation;

  console.log(currentToken?.value, nextToken?.value);
  if (currentToken?.value === expBox && nextCombOrPerm) {
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }

  if (nextToken?.value === expBox && greaterNextCombOrPerm) {
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }

  if (currentToken?.value === expBox && nextToken?.type === 'singleRoot') {
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }

  if (nextToken?.value === expBox && greaterNextToken?.type === 'singleRoot'){
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }

  if (nextToken?.value === expBox) {
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }

  if (currentToken?.type === 'superscriptValue' && nextCombOrPerm) {
    return replaceAt(currentInput, caretPos, 0, supers)
  }

  if (currentToken?.type === 'superscriptValue') {
    return replaceAt(currentInput, caretPos, 0, supers)
  }

  if (type === 'baseWithSupers'){
    return replaceAt(currentInput, caretPos, 0, valueWithoutX)
  }
  
  return replaceAt(currentInput, caretPos, 0, supers);
}







/**
 * Replaces a fixed number of characters at the caret position with a new string.
 *
 * Used when a placeholder or existing token must be removed before inserting
 * formatted content (e.g., replacing an exponent box or template).
 *
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - Position at which replacement begins.
 * @param {number} charsToRemove - Number of characters to remove.
 * @param {string} insert - String to insert at the caret position.
 * @returns {string} Updated input string.
 */
export function replaceAt(currentInput, caretPos, charsToRemove, insert) {
  const replaceInput = currentInput.slice(0, caretPos) + insert + currentInput.slice(caretPos + charsToRemove);
  return formatTokensForDisplay(replaceInput).text;
}






/**
 * Inserts a string at the specified caret position without removing any characters.
 *
 * The resulting string is formatted for display (e.g., superscripts, subscripts, etc.).
 *
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - Position at which the value should be inserted.
 * @param {string} newValue - String to insert at the caret position.
 * @returns {string} Updated input string formatted for display.
 */

export function insertAt(currentInput, caretPos, newValue) {
  console.log(currentInput, caretPos, newValue);
  const insertInput = currentInput.slice(0, caretPos) + newValue + currentInput.slice(caretPos);
  return formatTokensForDisplay(insertInput).text;
}






/**
 * Converts a normal string into its superscript representation.
 *
 * Characters that do not have a superscript mapping are preserved as-is.
 *
 * @param {string} newValue - String to convert.
 * @returns {string} Superscript-formatted string.
 */
function convertToSupers(newValue){
  return newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
}






/**
 * Removes the base character ('x') from a superscript string.
 *
 * Used when handling inputs that already include a base with superscript
 * to avoid duplicating the base symbol.
 *
 * @param {string} value - Superscript string.
 * @returns {string} Superscript string without the base character.
 */
function filterOut_baseX(value){
  return value.split("").filter(v => v !== 'x').join('');;
}







/**
 * Removes exponent placeholder boxes from a string.
 *
 * Useful when cleaning up formatted values before reinsertion.
 *
 * @param {string} value - Input string.
 * @returns {string} String without exponent placeholders.
 */
function filterOut_expBox(value){
  return value.split("").filter(v => v !== '□').join('');;
}






/**
 * Removes combinatorics parameter identifiers ('n' and 'r') from a string.
 *
 * Intended for internal cleanup when processing permutation or
 * combination expressions.
 *
 * @param {string} value - Input string.
 * @returns {string} Cleaned string without 'n' and 'r'.
 */
function filterOut_nAndr(value){
  return value.split("").filter(v => (v !== 'n' && v!== 'r')).join('');
}






/**
 * Calculates the visible character length of an HTML-formatted string.
 *
 * This function ignores markup and measures only rendered text content,
 * which is critical for accurate caret position calculations.
 *
 * @param {string} htmlString - String containing HTML markup.
 * @returns {number} Length of visible text content.
 */
// const measureNode = document.createElement('span');
// function getVisibleLength(htmlString) {
//   measureNode.innerHTML = htmlString;
//   return measureNode.textContent.length;
// }







/**
 * Inserts or replaces a subscript at the caret position.
 *
 * Handles expressions such as logarithms or combinatorics indices,
 * replacing a placeholder box if present and ensuring correct caret placement.
 * Special cases include interaction with combinatorics templates (nCr / nPr).
 * HTML formatting (e.g., <sub>) is applied to the inserted value.
 *
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to convert into a subscript.
 * @param {Object} nextToken - Token immediately after the caret.
 * @param {Object} greaterNextToken - Lookahead token for contextual checks.
 * @returns {string} Updated input string with the subscript applied.
 */

export function showIndices(currentInput, caretPos, newValue, nextToken, greaterNextToken) {
  const subs = convertToSubs(newValue);

  const boxLength = expBox.length;

  if ((nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation) && greaterNextToken?.value === expBox) {
    return replaceAt(currentInput, caretPos, 0, subs);
  }

  // Replace box with subscript if next token is a box
  if (nextToken?.value === expBox) {
    return replaceAt(currentInput, caretPos, boxLength, subs);
  }
  // Default: insert subscript at caret
  return replaceAt(currentInput, caretPos, 0, subs);
}






/**
 * Converts a normal string into its subscript representation.
 *
 * Characters without a subscript mapping are preserved.
 *
 * @param {string} newValue - String to convert.
 * @returns {string} Subscript-formatted string.
 */
function convertToSubs(newValue){
  return newValue.split("").map((d) => normalToSubscript[d] || d).join("");
}