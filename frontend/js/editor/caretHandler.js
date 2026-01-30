import {input} from '../ui/ui.js';



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
 * Sets the caret (cursor) at the specified character index inside a contenteditable element.
 * 
 * This function works correctly even when the element contains multiple text nodes
 * (for example, due to formatting like <sup>, <span>, etc.). It uses a TreeWalker
 * to traverse text nodes and locate the proper position for the caret.
 * 
 * Behavior:
 * - If the element is empty, it simply focuses it.
 * - If the caret position is within the total text length, it places the caret precisely.
 * - If the caret position exceeds the total text length, it falls back to placing
 *   the caret at the end of the element.
 *
 * @param {HTMLElement} inputElm - The contenteditable element in which to set the caret.
 * @param {number} caretPos - Desired caret index (0-based). Automatically clamped to [0, text length].
*/
export function caretShow(inputElm, caretPos){
  const text = inputElm.textContent;
  caretPos = Math.max(0, Math.min(caretPos, text.length));

  if(inputElm.textContent.length == 0){
    inputElm.focus();
  }else{
    const range = document.createRange();
    const sel = window.getSelection();
    console.log(inputElm.childNodes);

    let remaining = caretPos;
    const walker = document.createTreeWalker(inputElm, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = walker.nextNode())) {
      if (remaining <= node.textContent.length) {
        range.setStart(node, remaining);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return;
      }
      remaining -= node.textContent.length;
    }
    // fallback: place caret at end if index too large
    // range.selectNodeContents(container);
    range.selectNodeContents(inputElm);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
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
