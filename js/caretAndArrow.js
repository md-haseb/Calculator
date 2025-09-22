import {input} from './ui.js';

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

export function caretShowWithFocus(inputElm, caretPos){
  inputElm.focus();
  caretShow(inputElm, caretPos);
}