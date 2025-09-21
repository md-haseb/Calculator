import {input} from './ui.js';

function caretIndex(){
  const caretPosition = input.textContent.length;
  return caretPosition;
}

export function caretShow(inputElm){
  if(inputElm.textContent.length == 0){
    inputElm.focus();
  }else{
    const range = document.createRange();
    // range.selectNodeContents(inputElm);
    const textNode = inputElm.firstChild;
    range.setStart(textNode, caretIndex());
    range.setEnd(textNode, caretIndex());
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    inputElm.focus();
  }
}