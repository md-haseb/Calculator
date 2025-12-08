import { normalToSuperscript, normalToSubscript } from "../core/constants.js";
import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";

/**
 * Computes new caret position after inserting a special value.
 * @param {string} newValue - Value being inserted.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Updated caret position.
 */
export function getCaretAfterInsertion(newValue, caretPos) {
  if (newValue.includes('log')) return caretPos + 3;
  if (newValue.includes('√'))   return caretPos - 1;
  return caretPos; // default for x, C, P, etc.
}

/**
 * Inserts an exponent box (□) or special notation at the caret position.
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert.
 * @returns {string} Updated input string with exponent box inserted.
 */
export function showExponentBox(currentInput, caretPos, newValue) {
  if(newValue.includes('log')){
    return currentInput.slice(0, caretPos) + `log<sub>□</sub>()` + currentInput.slice(caretPos);
  }
  if(newValue.includes('√')){
    return currentInput.slice(0, caretPos) + `<sup>□</sup>√` + currentInput.slice(caretPos);
  }
  if(newValue.includes('C')){
    return currentInput.slice(0, caretPos) + `<sup>□</sup>C<sub>□</sub>` + currentInput.slice(caretPos);
  }
  if(newValue.includes('P')){
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
  const supers = newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
  const filterOut_baseX = supers.split("").filter(v => v !== 'x');

  const boxForExponent = "□";
  const boxLength = boxForExponent.length;
  const combinationTemp = `C<sub>□</sub>`;
  const combinationTempLength = combinationTemp.length;

  if (currentToken?.value === "□" && (nextToken?.value === 'C' || nextToken?.value === 'P')) {
    return (
      replaceAt(currentInput, caretPos, combinationTempLength, supers + combinationTemp)
    );
  }
  if (nextToken?.value === "□") {
    return (
      replaceAt(currentInput, caretPos, boxLength, supers)
    );
  }
  if (currentToken?.type === 'superscriptValue' && (nextToken?.value === 'C' || nextToken?.value === 'P')) {
    return (
      replaceAt(currentInput, caretPos, combinationTempLength, supers + combinationTemp)
    );
  }
  if (currentToken?.type === 'superscriptValue') {
    return (
      replaceAt(currentInput, caretPos, 0, supers)
    );
  }
  if (newValue.includes('x2') || newValue.includes('x3')){
    return replaceAt(currentInput, caretPos, 0, filterOut_baseX)
  }
  return replaceAt(currentInput, caretPos, 0, supers);
}

function replaceAt(currentInput, caretPos, charsToRemove, insert) {
  return currentInput.slice(0, caretPos) + insert + currentInput.slice(caretPos + charsToRemove);
}

/**
 * Replaces a box or placeholder with subscripted indices (used for log or functions).
 * @param {string} currentInput - Current input string.
 * @param {number} caretPos - Current caret position.
 * @param {string} newValue - Value to insert as subscript.
 * @returns {string} Updated input string with subscript applied.
 */
export function showIndicesForLog(currentInput, caretPos, newValue) {
  // const lastChar = currentInput[caretPos];
  const boxForIndices = currentInput[caretPos];
  console.log(boxForIndices);
  // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
  const subs = newValue.split("").map((d) => normalToSubscript[d] || d).join("");
  // const filterOut_baseX = supers.split("").filter(v => v !== 'x');
  // console.log(supers);
  // console.log(filterOut_baseX);

  if (boxForIndices === "□") {
    console.log(currentInput[caretPos + 1]);
    return (
      currentInput.slice(0, caretPos) +
      subs +
      currentInput.slice(caretPos + 1)
    );
  }
  if (Object.values(normalToSubscript).includes(currentInput[caretPos - 1])) {
    return (
      currentInput.slice(0, caretPos) + subs + currentInput.slice(caretPos)
    );
  }
  // if (newValue.includes('x2') || newValue.includes('x3')){
  //   return currentInput.slice(0, caretPos) + filterOut_baseX + currentInput.slice(caretPos);
  // }
  return currentInput.slice(0, caretPos) + subs + currentInput.slice(caretPos);
}