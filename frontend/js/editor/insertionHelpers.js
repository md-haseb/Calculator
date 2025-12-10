import { normalToSuperscript, normalToSubscript } from "../core/constants.js";
import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";

/**
 * Computes new caret position after inserting a special value.
 * @param {string} newValue - Value being inserted.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Updated caret position.
 */
export function getCaretAfterInsertion(newValue, caretPos) {
  const valueWithoutExpBox = filterOut_expBox(newValue);
  const stepForward = newValue.length;

  if (newValue.includes('log') && newValue.includes("□")) {
    return caretPos + valueWithoutExpBox.length;
  }
  // if (newValue.includes('√')) {
  //   return caretPos - valueWithoutExpBox.length;
  // }
  if (newValue.includes('x2') || newValue.includes('x3')) {
    const valueWithoutX = filterOut_baseX(newValue);
    return caretPos + valueWithoutX.length;
  }
  if ((newValue.includes('x') && newValue.includes('□')) || newValue.includes('C') || newValue.includes('P')) return caretPos;

  return caretPos + stepForward; // default for single insert
}

/**
 * Inserts an exponent box (□) or special notation at the caret position.
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert.
 * @returns {string} Updated input string with exponent box inserted.
 */
export function showExponentBox(currentInput, caretPos, newValue) {
  if (newValue.includes('log')) {
    return currentInput.slice(0, caretPos) + `log<sub>□</sub>()` + currentInput.slice(caretPos);
  }
  if (newValue.includes('√')) {
    return currentInput.slice(0, caretPos) + `<sup>□</sup>√` + currentInput.slice(caretPos);
  }
  if (newValue.includes('C')) {
    return currentInput.slice(0, caretPos) + `<sup>□</sup>C<sub>□</sub>` + currentInput.slice(caretPos);
  }
  if (newValue.includes('P')) {
    return currentInput.slice(0, caretPos) + `<sup>□</sup>P<sub>□</sub>` + currentInput.slice(caretPos);
  }
  return (
    currentInput.slice(0, caretPos) + `<sup>□</sup>` + currentInput.slice(caretPos)
  );
}

/**
 * Replaces the box or placeholder with superscripted value.
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert as superscript.
 * @returns {string} Updated input string with superscript applied.
 */

export function showExponent(currentInput, caretPos, newValue, currentToken, nextToken) {
  const supers = convertToSupers(newValue);
  const valueWithoutX = filterOut_baseX(supers);

  const boxForExponent = "□";
  const boxLength = boxForExponent.length;
  const combPermTemplate = makeCombPermTemplate(nextToken?.value);
  const combPermTemplateLen = combPermTemplate.length;

  if (currentToken?.value === "□" && (nextToken?.value === 'C' || nextToken?.value === 'P')) {
    return (
      replaceAt(currentInput, caretPos, combPermTemplateLen, supers + combPermTemplate)
    );
  }
  if (currentToken?.value === "□" && nextToken?.raw === "√"){
    return (
      replaceAt(currentInput, caretPos, boxLength, supers)
  );
  }
  if (nextToken?.value === "□") {
    return (
      replaceAt(currentInput, caretPos, boxLength, supers)
    );
  }
  if (currentToken?.type === 'superscriptValue' && (nextToken?.value === 'C' || nextToken?.value === 'P')) {
    return (
      replaceAt(currentInput, caretPos, combPermTemplateLen, supers + combPermTemplate)
    );
  }
  if (currentToken?.type === 'superscriptValue') {
    return (
      replaceAt(currentInput, caretPos, 0, supers)
    );
  }
  if (newValue.includes('x2') || newValue.includes('x3')){
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

  if (nextToken?.value === "□") {
    return (
      replaceAt(currentInput, caretPos, boxLength, subs)
    );
  }
  if (currentToken?.type === 'subscriptValue') {
    return (
      replaceAt(currentInput, caretPos, 0, subs)
    );
  }
  return replaceAt(currentInput, caretPos, 0, subs);
}

function convertToSubs(newValue){
  return newValue.split("").map((d) => normalToSubscript[d] || d).join("");
}