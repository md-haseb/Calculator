import {getTokens, getTokenAtCaret, getPrevToken, getNextToken} from "../core/tokenHelpers.js";
import {getCaretAfterInsertion, showExponentBox, showExponent, showIndicesForLog} from "./insertionHelpers.js";

// import { validateForDisplay, isOperator } from "../core/validation.js";
// import { normalToSuperscript, normalToSubscript, superscripts, superscriptToNormal } from "../core/constants.js";
// import { tokenize } from "../core/calculation.js";

/**
 * Inserts a new value into the current input string at the caret position.
 * Handles exponent box, exponents, indices, brackets, functions, and normal characters.
 * @param {string} currentInput - Current input string from display.
 * @param {number} caretPosition - Current caret position in the input.
 * @param {string} newValue - Value to insert (number, operator, function, or special symbol).
 * @returns {{newInput: string, newCaret: number}} Updated input string and new caret position.
 */
export function insertValue(currentInput, caretPosition, newValue) {
  const lastChar = currentInput[caretPosition - 1];

  const tokens = getTokens(currentInput);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  const nextToken = getNextToken(tokens, currentToken);
  console.log(tokens);
  console.log(currentToken);
  console.log(prevToken);
  console.log(nextToken);
  
  if (newValue.includes("□")) {
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: getCaretAfterInsertion(newValue, caretPosition),
      };
  }

  if(newValue.includes("n") && newValue.includes("r")){
      return {
        newInput: showExponentBox(currentInput, caretPosition, newValue),
        // newCaret: caretPosition + 1, // caret lands inside □
        newCaret: getCaretAfterInsertion(newValue, caretPosition),
      };
  }

  if(newValue.includes('x2') || newValue.includes('x3')){
    return{
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }
  
  // Case 2: filling exponent and indices (subscript)
  if(currentToken?.type === 'function' && nextToken?.type === 'box'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if ((currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal') && nextToken?.type === 'box') {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'combAndPerm' && nextToken?.type === 'box'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'box' && nextToken?.type === 'singleRoot'){ 
    return {
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'box' && nextToken?.type === 'combAndPerm'){ 
    return {
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }

  // Case 3: appending to superscript and subscript
  if (currentToken?.type === 'nthRoot' && caretPosition < currentToken?.end) {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }

  if (currentToken?.type === 'supAndSub') {
    return {
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'superscriptValue'){
    return {
      newInput: showExponent(currentInput, caretPosition, newValue, currentToken, nextToken),
      newCaret: caretPosition + 1,
    };
  }

  if(currentToken?.type === 'subscriptValue'){
    return {
      newInput: showIndicesForLog(currentInput, caretPosition, newValue),
      newCaret: caretPosition + 1,
    };
  }



  // Case 4: bracket handling → place caret inside
  if (newValue === "()") {
    return {
      newInput:
        currentInput.slice(0, caretPosition) +
        "()" +
        currentInput.slice(caretPosition),
      newCaret: caretPosition + 1, // caret is inside the brackets
    };
  }

  // Default case: normal insertion
  return {
    newInput:
      currentInput.slice(0, caretPosition) +
      newValue +
      currentInput.slice(caretPosition),
    newCaret: caretPosition + newValue.length,
  };
}

// /**
//  * Tokenizes the current input string.
//  * @param {string} currentInput - Input string to tokenize.
//  * @returns {Array} Array of token objects.
//  */
// function getTokens(currentInput){
//   return tokenize(currentInput);
// }

// /**
//  * Finds the token at a given caret position.
//  * @param {Array} tokens - Array of token objects.
//  * @param {number} caretPos - Caret position.
//  * @returns {Object|undefined} Token object at caret, or undefined.
//  */
// export function getTokenAtCaret(tokens, caretPos) {
//   return tokens.find(t => caretPos >= t.start && caretPos <= t.end);
// }

// /**
//  * Finds the previous token before a given token.
//  * @param {Array} tokens - Array of token objects.
//  * @param {Object} token - Current token.
//  * @returns {Object|undefined} Previous token, or undefined.
//  */
// export function getPrevToken(tokens, token) {
//   // Find all tokens that end before the current token starts
//   const previousTokens = tokens.filter(t => t.end <= token.start);
//   // Return the one with the **largest end position**
//   return previousTokens.sort((a, b) => b.end - a.end)[0];
// }

// /**
//  * Finds the next token after a given token.
//  * @param {Array} tokens - Array of token objects.
//  * @param {Object} token - Current token.
//  * @returns {Object|undefined} Next token, or undefined.
//  */
// export function getNextToken(tokens, token) {
//   // Find all tokens that end before the current token starts
//   const nextTokens = tokens.filter(t => t.start >= token.end);
//   // Return the one with the **largest end position**
//   return nextTokens.sort((a, b) => a.start - b.start)[0];
// }

// /**
//  * Inserts an exponent box (□) or special notation at the caret position.
//  * @param {string} currentInput - Current input string.
//  * @param {number} caretPos - Current caret position.
//  * @param {string} newValue - Value to insert.
//  * @returns {string} Updated input string with exponent box inserted.
//  */
// function showExponentBox(currentInput, caretPos, newValue) {
//   if(newValue.includes('log')){
//     return currentInput.slice(0, caretPos) + `log<sub>□</sub>()` + currentInput.slice(caretPos);
//   }
//   if(newValue.includes('√')){
//     return currentInput.slice(0, caretPos) + `<sup>□</sup>√` + currentInput.slice(caretPos);
//   }
//   if(newValue.includes('C')){
//     return currentInput.slice(0, caretPos) + `<sup>□</sup>C<sub>□</sub>` + currentInput.slice(caretPos);
//   }
//   if(newValue.includes('P')){
//     return currentInput.slice(0, caretPos) + `<sup>□</sup>P<sub>□</sub>` + currentInput.slice(caretPos);
//   }
//   return (
//     currentInput.slice(0, caretPos) + `<sup>□</sup>` + currentInput.slice(caretPos)
//   );
// }

// /**
//  * Computes new caret position after inserting a special value.
//  * @param {string} newValue - Value being inserted.
//  * @param {number} caretPos - Current caret position.
//  * @returns {number} Updated caret position.
//  */
// function getCaretAfterInsertion(newValue, caretPos) {
//   if (newValue.includes('log')) return caretPos + 3;
//   if (newValue.includes('√'))   return caretPos - 1;
//   return caretPos; // default for x, C, P, etc.
// }

// /**
//  * Replaces the box or placeholder with superscripted value.
//  * @param {string} currentInput - Current input string.
//  * @param {number} caretPos - Current caret position.
//  * @param {string} newValue - Value to insert as superscript.
//  * @returns {string} Updated input string with superscript applied.
//  */
// function showExponent(currentInput, caretPos, newValue) {
//   const boxForExponent = currentInput[caretPos];
//   // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
//   const supers = newValue.split("").map((d) => normalToSuperscript[d] || d).join("");
//   const filterOut_baseX = supers.split("").filter(v => v !== 'x');
//   console.log(supers);
//   console.log(filterOut_baseX);
//   if (boxForExponent === "□" && currentInput[caretPos + 1] === 'C') {
//     return (
//       currentInput.slice(0, caretPos) +
//       supers + `C<sub>□</sub>` + 
//       currentInput.slice(caretPos + 3)
//     );
//   }
//   if (boxForExponent === "□") {
//     return (
//       currentInput.slice(0, caretPos) +
//       supers +
//       currentInput.slice(caretPos + 1)
//     );
//   }
//   if (Object.values(normalToSuperscript).includes(currentInput[caretPos - 1])) {
//     return (
//       currentInput.slice(0, caretPos) + supers + currentInput.slice(caretPos)
//     );
//   }
//   if (newValue.includes('x2') || newValue.includes('x3')){
//     return currentInput.slice(0, caretPos) + filterOut_baseX + currentInput.slice(caretPos);
//   }
//   return currentInput.slice(0, caretPos) + supers + currentInput.slice(caretPos);
// }

// /**
//  * Replaces a box or placeholder with subscripted indices (used for log or functions).
//  * @param {string} currentInput - Current input string.
//  * @param {number} caretPos - Current caret position.
//  * @param {string} newValue - Value to insert as subscript.
//  * @returns {string} Updated input string with subscript applied.
//  */
// function showIndicesForLog(currentInput, caretPos, newValue) {
//   // const lastChar = currentInput[caretPos];
//   const boxForIndices = currentInput[caretPos];
//   console.log(boxForIndices);
//   // const filterOut_baseX = newValue.split("").map(v => normalToSuperscript[v]);
//   const subs = newValue.split("").map((d) => normalToSubscript[d] || d).join("");
//   // const filterOut_baseX = supers.split("").filter(v => v !== 'x');
//   // console.log(supers);
//   // console.log(filterOut_baseX);

//   if (boxForIndices === "□") {
//     console.log(currentInput[caretPos + 1]);
//     return (
//       currentInput.slice(0, caretPos) +
//       subs +
//       currentInput.slice(caretPos + 1)
//     );
//   }
//   if (Object.values(normalToSubscript).includes(currentInput[caretPos - 1])) {
//     return (
//       currentInput.slice(0, caretPos) + subs + currentInput.slice(caretPos)
//     );
//   }
//   // if (newValue.includes('x2') || newValue.includes('x3')){
//   //   return currentInput.slice(0, caretPos) + filterOut_baseX + currentInput.slice(caretPos);
//   // }
//   return currentInput.slice(0, caretPos) + subs + currentInput.slice(caretPos);
// }

/**
 * Replaces the last character in the input with a new operator.
 * @param {string} currentInput - Current input string.
 * @param {string} newValue - New operator to replace the last one.
 * @returns {string} Updated input string with operator replaced.
 */
export function replaceOperator(currentInput, newValue) {
  return currentInput.slice(0, -1) + newValue;
}