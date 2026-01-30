

/**
 * Returns the index of the token currently under the caret.
 * The caret is mapped to the character just before its position.
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Token index at caret, or -1 if none.
 */

export function getCurrTokenIndexFromCaret(map, caretPos) {
  if (caretPos <= 0) return -1;
  const i = Math.min(caretPos - 1, map.length - 1);
  return map[i];
}





/**
 * Returns the index of the token immediately preceding the current token.
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Previous token index, or -1 if none exists.
 */

export function getPrevTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos - 2; i >= 0; i--) {
    if (map[i] !== current) {
      return map[i];
    }
  }
  return -1;
}





/**
 * Returns the index of the token two positions before the current token
 * (i.e., the token before the previous token).
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Greater-previous token index, or -1 if none exists.
 */

export function getGreaterPrevTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);
  const prev = getPrevTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos - 2; i >= 0; i--) {
    if (map[i] !== current && map[i] !== prev) {
      return map[i];
    }
  }
  return -1;
}





/**
 * Returns the index of the token immediately following the current token.
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Next token index, or -1 if none exists.
 */

export function getNextTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos; i < map.length; i++) {
    if (map[i] !== current) {
      return map[i];
    }
  }
  return -1;
}





/**
 * Returns the index of the token two positions after the current token
 * (i.e., the token after the next token).
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {number} Greater-next token index, or -1 if none exists.
 */

export function getGreaterNextTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);
  const next = getNextTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos; i < map.length; i++) {
    if (map[i] !== current && map[i] !== next) {
      return map[i];
    }
  }
  return -1;
}





/**
 * Returns the caret position immediately after the given token.
 * The caret is placed after the last character that belongs to the token.
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} targetTokenIndex - Token index to move past.
 * @returns {number} Caret position after the token, or 0 if not found.
 */

export function getCaretAfterToken(map, targetTokenIndex) {
  if (targetTokenIndex < 0) return 0;

  let lastIndex = -1;
  
  for (let i = 0; i < map.length; i++) {
    if (map[i] === targetTokenIndex) {
      lastIndex = i;
    }
  }
  
  return lastIndex === -1 ? 0 : lastIndex + 1;
}





/**
 * Checks whether the caret is positioned at the start of the current token.
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {boolean} True if caret is at the token's start boundary.
 */

export function isAtStartOfCurrentToken(map, caretPos) {
  if (caretPos <= 0) return true; // caret at very beginning is start of token

  const idx = caretPos - 1;
  const curr = map[idx];
  const prev = map[idx - 1];

  // previous display index belongs to a different token
  return prev !== curr;
}





/**
 * Checks whether the caret is positioned at the end of the current token.
 *
 * @param {number[]} map - Array mapping character positions to token indices.
 * @param {number} caretPos - Current caret position.
 * @returns {boolean} True if caret is at the token's end boundary.
 */

export function isAtEndOfCurrentToken(map, caretPos) {
  if (caretPos <= 0) return false;

  const idx = caretPos - 1;
  const curr = map[idx];
  const next = map[idx + 1];

  // next display index belongs to a different token
  return next !== curr;
}