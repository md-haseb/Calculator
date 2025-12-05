import { insertValue, replaceOperator } from "./insertion.js";
import { tokenize } from "../core/tokenize.js";
import { getTokenAtCaret, getPrevToken, getNextToken } from "../core/tokenHelpers.js";
import { validateForDisplay, validateForEvaluation } from "../core/validation.js";
import { calculate } from "../core/calculation.js";

export function handleInputClick(input, clickedRange){
  const tokens = tokenize(input.textContent);
  const currentToken = getTokenAtCaret(tokens, clickedRange.offset);
  
  const finalOffset = currentToken?.type === 'function' 
  ? currentToken.start 
  : clickedRange.offset;

  return finalOffset;
}

export function handleAC(){
  return{
    newInput: '',
    newCaret: 0, 
    showMsg: true,
  }
}

export function handleDelete(inputText, caretPosition){
  if(caretPosition === 0){
    return{
      newInput: inputText,
      newCaret: 0,
      showMsg: true,
    }
  }
  return{
    newInput: inputText.slice(0, caretPosition - 1) + inputText.slice(caretPosition),
    newCaret: caretPosition - 1,
    showMsg: true,
  }
}

export function handleFunctions(value, inputText, caretPosition){
  const funcLength = value.length;
  return{
    newInput: inputText.slice(0, caretPosition)+ `${value}()` + inputText.slice(caretPosition), 
    newCaret: caretPosition + funcLength + 1,
    showMsg: true,
  }
}

export function handleEqual(inputText){
  const newInput = calculate(inputText);
    return{
      newInput,
      newCaret: newInput.length,
      showMsg: true,
    }
}

export function handleLeftArrow(inputText, caretPosition){
  const tokens = tokenize(inputText);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  if(currentToken?.type === 'parenOpen' && prevToken?.type === 'function' && prevToken?.value === 'ln'){
    // caretShowWithFocus(input, caretPosition - 3);
    // return;
    return{
      newInput: inputText,
      newCaret: caretPosition - 3,
      showMsg: true,
    }
  }
  if(currentToken?.type === 'parenOpen' && prevToken?.type === 'function'){
    // caretShowWithFocus(input, caretPosition - 4);
    // return;
    return{
      newInput: inputText,
      newCaret: caretPosition - 4,
      showMsg: true,
    }
    }
  // caretShowWithFocus(input, caretPosition - 1);
  // return;
  return{
      newInput: inputText,
      newCaret: caretPosition - 1,
      showMsg: true,
  }
}

export function handleRightArrow(inputText, caretPosition){
  const tokens = tokenize(inputText);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const nextToken = getNextToken(tokens, currentToken);
  if(nextToken?.type === 'function' && nextToken?.value === 'ln'){
    // caretShowWithFocus(input, caretPosition + 3);
    // return;
    return{
      newInput: inputText,
      newCaret: caretPosition + 3,
      showMsg: true,
    }
  }
  if(nextToken?.type === 'function'){
    // caretShowWithFocus(input, caretPosition + 4);
    // return;
    return{
      newInput: inputText,
      newCaret: caretPosition + 4,
      showMsg: true,
    }
  }
  // caretShowWithFocus(input, caretPosition + 1);
  // return;
  return{
      newInput: inputText,
      newCaret: caretPosition + 1,
      showMsg: true,
    }
}


