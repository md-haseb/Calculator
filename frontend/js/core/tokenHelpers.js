import { tokenize } from './tokenize.js';

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
  const previousTokens = tokens.filter(t => t.end <= token.start);
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
  const nextTokens = tokens.filter(t => t.start >= token.end);
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
export function tokenValues(expr){
  const tokenObjects = tokenize(expr);
  const initialFilter = tokenObjects.map(t => {
  // some tokens have .value, some have .raw
  if ("value" in t) return t.value;
  if ("raw" in t) return t.raw;
  return null; // fallback (should not happen)
  });
  return initialFilter.filter(v => v !== null);
}
