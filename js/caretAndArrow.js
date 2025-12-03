import {input} from './ui.js';

/**
 * Returns the current caret (cursor) index inside a contenteditable element.
 * It calculates how many characters exist from the start of the element
 * up to the caret's current position.
 *
 * @param {HTMLElement} inputElm - The contenteditable element.
 * @returns {number} The caret index (0 if no selection range exists).
 */
export function caretIndex(inputElm){
  const selection = window.getSelection();

  if(!selection.rangeCount){
    return 0;
  }

  const range = selection.getRangeAt(0);
  const preRange = range.cloneRange();
  preRange.selectNodeContents(inputElm);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
}

/**
 * Sets the caret (cursor) at a given character position inside
 * a contenteditable element. Works even when the element is empty.
 *
 * @param {HTMLElement} inputElm - The contenteditable element.
 * @param {number} caretPos - Desired caret position (auto-clamped to valid range).
 */
export function caretShow(inputElm, caretPos){
  const text = inputElm.textContent;
  caretPos = Math.max(0, Math.min(caretPos, text.length));

  if(inputElm.textContent.length == 0){
    inputElm.focus();
  }else{
    const range = document.createRange();
    // range.selectNodeContents(inputElm);
    const textNode = inputElm.firstChild || inputElm.appendChild(document.createTextNode("")); 
    range.setStart(textNode, caretPos);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * Focuses the contenteditable element and then places the caret
 * at the specified character position.
 *
 * @param {HTMLElement} inputElm - The contenteditable element.
 * @param {number} caretPos - Desired caret index.
 */
export function caretShowWithFocus(inputElm, caretPos){
  inputElm.focus();
  caretShow(inputElm, caretPos);
}