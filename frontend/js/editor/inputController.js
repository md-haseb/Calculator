import { insertValue, replaceOperator } from "./insertion.js";
import { tokenize } from "../core/tokenize.js";
import { getTokenAtCaret, getPrevToken, getNextToken } from "../core/tokenHelpers.js";
import { validateForDisplay, validateForEvaluation } from "../core/validation.js";
import { calculate } from "../core/calculation.js";
import { showIndices, insertAt, makeCombPermTemplate } from "../editor/insertionHelpers.js";
import { combinatorics, expBox } from "../core/constants.js";

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
  const tokens = tokenize(inputText);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const prevToken = getPrevToken(tokens, currentToken);
  const nextToken = getNextToken(tokens, currentToken);

  if(caretPosition === 0){
    return{
      newInput: inputText,
      newCaret: 0,
      showMsg: true,
    }
  }

  if(currentToken.type === 'parenClose'){
    return deleteForParens(inputText, caretPosition, currentToken);
  }

  if(currentToken.type === 'parenOpen' && prevToken.type === 'function'){
    return deleteForFunction(inputText, caretPosition, prevToken, nextToken);
  }

  return deleteBeforeCaret(inputText, caretPosition);
}

export function handleFunctions(value, inputText, caretPosition){
  const funcLength = value.length;
  const insertValue = `${value}()`;
  console.log(insertValue);
  const parenOpenLen = 1;
  return{
    newInput: insertAt(inputText, caretPosition, insertValue),
    newCaret: caretPosition + funcLength + parenOpenLen,
    showMsg: true,
  }
}

export function handleEqual(inputText){
  const newInput = calculate(inputText);
  console.log(newInput);
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

  const currentTokenLen = currentToken?.value.length;
  const prevTokenLength = prevToken?.value.length;
  const charsToRemove = prevTokenLength + currentTokenLen;

  const moveLeft = 1;

  if(currentToken?.type === 'parenOpen' && prevToken?.type === 'function'){
    return{
      newInput: inputText,
      newCaret: caretPosition - charsToRemove,
      showMsg: true,
    }
  }
  return{
      newInput: inputText,
      newCaret: caretPosition - moveLeft,
      showMsg: true,
  }
}

export function handleRightArrow(inputText, caretPosition){
  const tokens = tokenize(inputText);
  const currentToken = getTokenAtCaret(tokens, caretPosition);
  const nextToken = getNextToken(tokens, currentToken);
  const greaterNextToken = getNextToken(tokens, nextToken);
  const nextTokenLength = nextToken?.value.length;

  const combOrPermTemp = makeCombPermTemplate(nextToken?.value);

  const parenOpenLen = 1;
  const moveRight = 1;
  const charsToRemove = nextTokenLength + parenOpenLen;

  if(nextToken?.type === 'function'){
    return{
      newInput: inputText,
      newCaret: caretPosition + charsToRemove,
      showMsg: true,
    }
  }

  if ((nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation) && greaterNextToken?.value === expBox) {
    return {
      newInput: showIndices(inputText, caretPosition, combOrPermTemp, nextToken, greaterNextToken),
      newCaret: caretPosition + moveRight,
      showMsg: true,
    }
  }
  
  return{
      newInput: inputText,
      newCaret: caretPosition + moveRight,
      showMsg: true,
    }
}

//helpers
export function deleteBeforeCaret(inputText, caretPos) {
  const defaultdeleteStep = 1;
  return {
    newInput: inputText.slice(0, caretPos - defaultdeleteStep) + inputText.slice(caretPos),
    newCaret: caretPos - defaultdeleteStep,
    showMsg: true,
  }
}

export function deleteForParens(inputText, caretPos, currentToken) {
  const parenCloseLen = 1;
  const lastChLen = 1;
  const charsToRemove = parenCloseLen + lastChLen; // ")" + inside char
  const start = caretPos - charsToRemove;
  const end = currentToken.start;

  return{
      newInput: inputText.slice(0, start) + inputText.slice(end),
      newCaret: caretPos - charsToRemove,
      showMsg: true,
    }
}

export function deleteForFunction(inputText, caretPos, funcToken, nextToken) {
  const parenOpenLen = 1;
  const lastOperatorLen = 1;
  const charsToRemove = parenOpenLen + funcToken.value.length + lastOperatorLen; // "(" + "func" + operator before func
  const start = caretPos - charsToRemove;
  const end = nextToken.end;

  return{
      newInput: inputText.slice(0, start) + inputText.slice(end),
      newCaret: caretPos - charsToRemove,
      showMsg: true,
    }
}