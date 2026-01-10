import { normalToSuperscript, normalToSubscript, combinatorics, expBox } from "../core/constants.js";
import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";
import {classifyButtonValue} from '../core/classifyBtn.js';
import {formatTokensForDisplay} from '../ui/formatDisplay.js';

/**
 * Computes new caret position after inserting a special value.
 * @param {string} newValue - Value being inserted.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Updated caret position.
 */
// export function getCaretAfterInsertion(newValue, caretPos) {
//   const {type, value} = classifyButtonValue(newValue);
//   let caretMovement;
//   let cleaned;
//   const stepForward = value.length;
//   const caretInsideParens = 1;

//   switch (type) {
//     case 'logWithBox':
//       cleaned = filterOut_expBox(value);
//       caretMovement = cleaned.length;
//       break;

//     case 'baseWithSupers':
//       cleaned = filterOut_baseX(value);
//       caretMovement = cleaned.length;
//       break;

//     case 'parentheses':
//       caretMovement = caretInsideParens;
//       break;

//     case 'baseWithBox':
//     case 'combOrPerm':
//     case 'boxWithRoot':
//       caretMovement = 0;
//       break;

//     default:
//       caretMovement = stepForward; // default for single insert
//   }

//   return caretPos + caretMovement; 
// }

/**
 * Inserts an exponent box (□) or special notation at the caret position.
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert.
 * @returns {string} Updated input string with exponent box inserted.
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
 * Handles insertion and replacement logic for superscript (exponent) values.
 *
 * This function determines how a superscript should be applied based on:
 * - The current caret position
 * - The surrounding tokens (current, next, and lookahead tokens)
 * - Whether the exponent replaces a placeholder box, extends an existing
 *   superscript, or interacts with combinatorics (nCr / nPr) templates.
 *
 * It also accounts for visible-length differences when HTML markup
 * (e.g., <sub>) is present in the input string.
 *
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - The current caret position.
 * @param {string} newValue - Raw value to be converted to superscript.
 * @param {Object} currentToken - Token at the caret position.
 * @param {Object} nextToken - Token immediately after the caret.
 * @param {Object} greaterNextToken - Lookahead token used for contextual decisions.
 * @returns {string} Updated input string with the superscript applied.
 */

export function showExponent(currentInput, caretPos, newValue, currentToken, nextToken, greaterNextToken) {
  const {type, value} = classifyButtonValue(newValue);
  const supers = convertToSupers(value);
  const valueWithoutX = filterOut_baseX(supers);

  const boxLength = expBox.length;

  const nextCombOrPerm = nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation;
  const greaterNextCombOrPerm = greaterNextToken?.value === combinatorics.combination || greaterNextToken?.value === combinatorics.permutation;

  const greaterCombinatoricsTemp =  makeCombPermTemplate(greaterNextToken?.value);
  const nextCombinatoricsTemp = makeCombPermTemplate(nextToken?.value);

  const greaterCombinatoricsTempLen = getVisibleLength(greaterCombinatoricsTemp);
  const nextCombinatoricsTempLen = getVisibleLength(nextCombinatoricsTemp);
  // console.log(currentToken?.type);
  // console.log(currentToken?.value);
  // console.log(nextCombOrPerm);

  
  if (currentToken?.value === expBox && nextCombOrPerm) {
    return replaceAt(currentInput, caretPos, nextCombinatoricsTempLen + boxLength, supers + nextCombinatoricsTemp);
  }
  if (nextToken?.value === expBox && greaterNextCombOrPerm) {
    return replaceAt(currentInput, caretPos, greaterCombinatoricsTempLen + boxLength, supers + greaterCombinatoricsTemp);
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
    console.log('hello');
    return replaceAt(currentInput, caretPos, nextCombinatoricsTempLen, supers + nextCombinatoricsTemp)
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
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - Position at which the value should be inserted.
 * @param {string} newValue - String to insert.
 * @returns {string} Updated input string.
 */
export function insertAt(currentInput, caretPos, newValue) {
  const insertInput = currentInput.slice(0, caretPos) + newValue + currentInput.slice(caretPos);
  console.log(insertInput);
  console.log(formatTokensForDisplay(insertInput).text);
  return formatTokensForDisplay(insertInput).text;
  // return currentInput.slice(0, caretPos) + newValue + currentInput.slice(caretPos);
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
 * Creates an HTML template for combinatorics expressions (nCr / nPr).
 *
 * The template appends a subscripted exponent placeholder to the given token.
 *
 * @param {string} [token=''] - Base combinatorics symbol.
 * @returns {string} HTML-formatted combinatorics template.
 */
export function makeCombPermTemplate(token = ''){
  return `${token}<sub>${expBox}</sub>`;
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
const measureNode = document.createElement('span');
function getVisibleLength(htmlString) {
  measureNode.innerHTML = htmlString;
  return measureNode.textContent.length;
}


/**
 * Handles insertion and replacement logic for subscripted indices.
 *
 * Used for expressions such as logarithms or combinatorics indices,
 * where values must appear as subscripts and may replace a placeholder box.
 *
 * The function also handles interaction with combinatorics templates
 * and ensures correct caret positioning when HTML markup is involved.
 *
 * @param {string} currentInput - The current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Raw value to be converted to subscript.
 * @param {Object} nextToken - Token immediately after the caret.
 * @param {Object} greaterNextToken - Lookahead token for contextual checks.
 * @returns {string} Updated input string with subscript applied.
 */
export function showIndices(currentInput, caretPos, newValue, nextToken, greaterNextToken) {
  const subs = convertToSubs(newValue);

  const boxLength = expBox.length;
  const combOrPermTemp = makeCombPermTemplate(nextToken?.value);
  const combOrPermTempLen = getVisibleLength(combOrPermTemp);

  if ((nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation) && greaterNextToken?.value === expBox) {
    console.log('hello');
    return replaceAt(currentInput, caretPos, combOrPermTempLen, combOrPermTemp);
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