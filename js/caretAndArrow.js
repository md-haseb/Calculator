import {input} from './ui.js';

export function caretIndex(inputElm){
  // const caretPosition = input.textContent.length;
  // return caretPosition;
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
    const textNode = inputElm.firstChild;
    range.setStart(textNode, caretPos);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    inputElm.focus();
    console.log(caretIndex(inputElm));
  }
}

// export function caretBasedInput(newValue){
//   input.textContent = input.textContent.slice(0, caretIndex) + newValue + input.textContent.slice(caretIndex);
// }