import { tokenize } from './tokenize.js';
import { isOperator } from './validation.js';

/**
 * Tokenizes the current input string.
 * @param {string} currentInput - Input string to tokenize.
 * @returns {Array} Array of token objects.
 */
export function getTokens(currentInput){
  return tokenize(currentInput);
}

/**
 * Finds the token at a given caret position.
 * @param {Array} tokens - Array of token objects.
 * @param {number} caretPos - Caret position.
 * @returns {Object|undefined} Token object at caret, or undefined.
 */
export function getTokenAtCaret(tokens, caretPos) {
  return tokens.find(t => caretPos >= t.start && caretPos <= t.end);
}

/**
 * Finds the previous token before a given token.
 * @param {Array} tokens - Array of token objects.
 * @param {Object} token - Current token.
 * @returns {Object|undefined} Previous token, or undefined.
 */
export function getPrevToken(tokens, token) {
  // Find all tokens that end before the current token starts
  console.log(token);
  const previousTokens = tokens.filter(t => t.end <= token?.start);
  // Return the one with the **largest end position**
  return previousTokens.sort((a, b) => b.end - a.end)[0];
}

/**
 * Finds the next token after a given token.
 * @param {Array} tokens - Array of token objects.
 * @param {Object} token - Current token.
 * @returns {Object|undefined} Next token, or undefined.
 */
export function getNextToken(tokens, token) {
  // Find all tokens that end before the current token starts
  const nextTokens = tokens.filter(t => t.start >= token?.end);
  // Return the one with the **largest end position**
  return nextTokens.sort((a, b) => a.start - b.start)[0];
}

/**
 * Generates array of token values from token objects.
 * Extracts the string value from token objects for processing.
 * Some tokens use `.value`, others use `.raw`.
 * @param {string} expr 
 * @returns {Array<string>}
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

