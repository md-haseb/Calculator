import { tokenize } from './tokenize.js';
import { isOperator } from './validation.js';





/**
 * Tokenizes a mathematical input string into an array of token objects.
 *
 * Delegates the actual tokenization to the underlying `tokenize` function.
 * Tokens may represent numbers, operators, functions, constants, parentheses,
 * superscripts/subscripts, roots, factorials, percentages, or combinatorics symbols.
 *
 * @param {string} currentInput - The mathematical expression to tokenize.
 * @returns {Array<Object>} Array of token objects representing the parsed input.
 */

export function getTokens(currentInput){
  return tokenize(currentInput);
}






/**
 * Retrieves the token object at a specific caret (cursor) position.
 *
 * Iterates through the array of token objects and returns the token
 * whose start and end positions enclose the given caret position.
 *
 * @param {Array<Object>} tokens - Array of token objects, each with `start` and `end` properties.
 * @param {number} caretPos - The current caret (cursor) position in the input string.
 * @returns {Object|undefined} The token object at the caret position, or undefined if none found.
 */

export function getTokenAtCaret(tokens, caretPos) {
  return tokens.find(t => caretPos >= t.start && caretPos <= t.end);
}






/**
 * Retrieves the token immediately preceding a given token in an array of tokens.
 *
 * Searches for all tokens that end before the current token's start position
 * and returns the one with the largest end value (i.e., the closest previous token).
 *
 * @param {Array<Object>} tokens - Array of token objects, each with `start` and `end` properties.
 * @param {Object} token - The reference token to find the previous token for.
 * @returns {Object|undefined} The token object immediately before the given token, or undefined if none exists.
 */

export function getPrevToken(tokens, token) {
  // Find all tokens that end before the current token starts
  console.log(token);
  const previousTokens = tokens.filter(t => t.end <= token?.start);
  // Return the one with the **largest end position**
  return previousTokens.sort((a, b) => b.end - a.end)[0];
}






/**
 * Retrieves the token immediately following a given token in an array of tokens.
 *
 * Searches for all tokens that start after the current token's end position
 * and returns the one with the smallest start value (i.e., the closest next token).
 *
 * @param {Array<Object>} tokens - Array of token objects, each with `start` and `end` properties.
 * @param {Object} token - The reference token to find the next token for.
 * @returns {Object|undefined} The token object immediately after the given token, or undefined if none exists.
 */

export function getNextToken(tokens, token) {
  // Find all tokens that end before the current token starts
  const nextTokens = tokens.filter(t => t.start >= token?.end);
  // Return the one with the **largest end position**
  return nextTokens.sort((a, b) => a.start - b.start)[0];
}






/**
 * Extracts the string values from an array of token objects for further processing.
 *
 * Some token objects store their content in the `value` property, while others
 * use the `raw` property. This function normalizes them into a simple array of strings.
 *
 * @param {Array<Object>} tokenObjects - Array of token objects from tokenization.
 * @returns {Array<string>} Array of token string values, with null or invalid tokens filtered out.
 */

export function tokenValues(tokenObjects){
  // const tokenObjects = tokenize(expr);
  const initialFilter = tokenObjects.map(t => {
  // some tokens have .value, some have .raw
  if ("value" in t) return t.value;
  if ("raw" in t) return t.raw;
  return null; // fallback (should not happen)
  });
  return initialFilter.filter(v => v !== null);
}





/**
 * Normalizes unary minus operators in a token array.
 *
 * Converts a minus sign (`-`) that represents a unary negation into a
 * special token `'NEG'`. A minus is considered unary if it appears:
 *   - At the beginning of the expression
 *   - Immediately after an opening parenthesis `(` 
 *   - Immediately after another operator
 *
 * This allows consistent handling of unary negation during postfix conversion
 * and evaluation.
 *
 * @param {Array<string>} tokens - Array of token strings (numbers, operators, parentheses, etc.).
 * @returns {Array<string>} New array of tokens with unary minus normalized to `'NEG'`.
 */

export function normalizeUnaryMinus(tokens) {
  const result = [];
  let prev = null;

  for (const token of tokens) {
    if (
      token === '-' &&
      (prev === null || prev === '(' || isOperator(prev))
    ) {
      result.push('NEG');
    } else {
      result.push(token);
    }
    prev = token;
  }

  return result;
}





/**
 * Determines whether an implicit multiplication is required between two tokens.
 *
 * In mathematical expressions, multiplication is sometimes implied without an explicit
 * operator, e.g., `2π`, `(3)(4)`, `5√9`, `nCr5`. This function checks the types of the
 * previous token (`prev`) and the current token (`curr`), along with optional context
 * (`greaterPrev` and `next`), to decide if a multiplication operator should be inserted.
 *
 * @param {Object} greaterPrev - The token before `prev`, used for certain combinatorics cases.
 * @param {Object} prev - The token preceding the current token.
 * @param {Object} curr - The current token being evaluated.
 * @param {Object} next - The token following the current token, used for superscript/combinatorics context.
 * @returns {boolean} `true` if an implicit multiplication should be inserted between `prev` and `curr`; otherwise `false`.
 */

export function needsImplicitMultiply(greaterPrev, prev, curr, next) {
  const prevCanEndValue =
    prev.type === 'number' ||
    prev.type === 'parenClose' ||
    prev.type === 'factorial' ||
    prev.type === 'constant' ||
    // prev.type === 'function' ||
    prev.type === 'supAndSub' ||
    prev.type === 'subscriptValue' && greaterPrev.type === 'combAndPerm';

  const currCanStartValue =
    curr.type === 'number' ||
    curr.type === 'parenOpen' ||
    curr.type === 'constant' ||
    curr.type === 'function' ||
    curr.type === 'singleRoot' || 
    curr.type === 'nthRoot' || 
    curr.type === 'supAndSub' || 
    curr.type === 'superscriptValue' || 
    curr.type === 'superscriptValue' && next.type === 'combAndPerm';

  return prevCanEndValue && currCanStartValue;
}






/**
 * Inserts explicit multiplication operators (`*`) where implicit multiplication is implied.
 *
 * In mathematical expressions, multiplication is often implied without an explicit operator,
 * for example:
 *   - Between a number and a constant: `2π` → `2 * π`
 *   - Between parentheses: `(3)(4)` → `(3) * (4)`
 *   - Before roots, superscripts, or combinatorics functions: `5√9`, `2³nCr`
 *
 * This function iterates through the token array and inserts an operator token
 * whenever `needsImplicitMultiply` returns true for a given pair of tokens.
 *
 * @param {Array<Object>} tokens - Array of token objects from tokenization.
 * @returns {Array<Object>} New array of token objects with explicit multiplication operators inserted.
 */

export function insertImplicitMultiplication(tokens) {
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];
    const prev = result[result.length - 1];
    const greaterPrev = result[result.length - 2];
    const next = tokens[i + 1];

    if (prev && needsImplicitMultiply(greaterPrev, prev, curr, next)) {
      // Place '*' right after prev token ends
      const start = prev.end;
      const end = prev.end + 1; // just add 1 as a placeholder
      result.push({ type: 'operator', value: '*', start, end });
    }

    result.push(curr);
  }

  return result;
}

