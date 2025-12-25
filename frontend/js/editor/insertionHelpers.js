import { normalToSuperscript, normalToSubscript } from "../core/constants.js";
import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";
import {classifyButtonValue} from '../core/classifyBtn.js';

/**
 * Computes new caret position after inserting a special value.
 * @param {string} newValue - Value being inserted.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Updated caret position.
 */
export function getCaretAfterInsertion(newValue, caretPos) {
  const {type, value} = classifyButtonValue(newValue);
  let caretMovement;
  let cleaned;
  const stepForward = value.length;
  const caretInsideParens = 1;

  switch (type) {
    case 'logWithBox':
      cleaned = filterOut_expBox(value);
      caretMovement = cleaned.length;
      break;

    case 'baseWithSupers':
      cleaned = filterOut_baseX(value);
      caretMovement = cleaned.length;
      break;

    case 'parentheses':
      caretMovement = caretInsideParens;
      break;

    case 'baseWithBox':
    case 'combOrPerm':
    case 'boxWithRoot':
      caretMovement = 0;
      break;

    default:
      caretMovement = stepForward; // default for single insert
  }

  return caretPos + caretMovement; 
}

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

  return insertAt(currentInput, caretPos, valueToInsert);
}

/**
 * Replaces the box or placeholder with superscripted value.
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert as superscript.
 * @returns {string} Updated input string with superscript applied.
 */

export function showExponent(currentInput, caretPos, newValue, currentToken, nextToken) {
  const {type, value} = classifyButtonValue(newValue);
  const supers = convertToSupers(value);
  const valueWithoutX = filterOut_baseX(supers);

  const boxForExponent = "□";
  const boxLength = boxForExponent.length;
  const nextIsCombOrPerm = nextToken?.value === 'C' || nextToken?.value === 'P';
  const combPermTemplate = makeCombPermTemplate(nextToken?.value);
  const combPermTemplateLen = combPermTemplate.length;

  if (currentToken?.value === "□" && nextIsCombOrPerm) {
    return replaceAt(currentInput, caretPos, combPermTemplateLen, supers + combPermTemplate);
  }
  if (currentToken?.value === "□" && nextToken?.raw === "√"){
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }
  if (nextToken?.value === "□") {
    return replaceAt(currentInput, caretPos, boxLength, supers);
  }
  if (currentToken?.type === 'superscriptValue' && nextIsCombOrPerm) {
    return replaceAt(currentInput, caretPos, combPermTemplateLen, supers + combPermTemplate)
  }
  if (currentToken?.type === 'superscriptValue') {
    return replaceAt(currentInput, caretPos, 0, supers)
  }
  if (type === 'baseWithSupers'){
    return replaceAt(currentInput, caretPos, 0, valueWithoutX)
  }
  return replaceAt(currentInput, caretPos, 0, supers);
}

export function replaceAt(currentInput, caretPos, charsToRemove, insert) {
  return currentInput.slice(0, caretPos) + insert + currentInput.slice(caretPos + charsToRemove);
}

export function insertAt(currentInput, caretPos, newValue) {
  return currentInput.slice(0, caretPos) + newValue + currentInput.slice(caretPos);
}

function convertToSupers(newValue){
  return newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
}

function filterOut_baseX(value){
  return value.split("").filter(v => v !== 'x');
}

function filterOut_expBox(value){
  return value.split("").filter(v => v !== '□');
}

function filterOut_nAndr(value){
  return value.split("").filter(v => (v !== 'n' && v!== 'r')).join('');
}

function makeCombPermTemplate(token){
  return `${token}<sub>□</sub>`;
}
/**
 * Replaces a box or placeholder with subscripted indices (used for log or functions).
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert as subscript.
 * @returns {string} Updated input string with subscript applied.
 */
export function showIndices(currentInput, caretPos, newValue, currentToken, nextToken) {
  const subs = convertToSubs(newValue);

  const boxForExponent = "□";
  const boxLength = boxForExponent.length;

  // Replace box with subscript if next token is a box
  if (nextToken?.value === "□") {
    return replaceAt(currentInput, caretPos, boxLength, subs);
  }
  // Default: insert subscript at caret
  return replaceAt(currentInput, caretPos, 0, subs);
}

function convertToSubs(newValue){
  return newValue.split("").map((d) => normalToSubscript[d] || d).join("");
}