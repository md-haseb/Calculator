import { insertValue, replaceOperator } from "./insertion.js";
import { tokenize } from "../core/tokenize.js";
import { getTokens, getTokenAtCaret, getPrevToken, getNextToken } from "../core/tokenHelpers.js";
import { validateForDisplay, validateForEvaluation } from "../core/validation.js";
import { calculate } from "../core/calculation.js";
import { insertAt } from "../editor/insertionHelpers.js";
// import { showIndices, insertAt, makeCombPermTemplate } from "../editor/insertionHelpers.js";
import { combinatorics, expBox, decimal, minus, operators, pi, E } from "../core/constants.js";
import { formatTokensForDisplay } from "../ui/formatDisplay.js";
import { normalizeTokens } from '../core/normalizeTokens.js';
import { getCurrTokenIndexFromCaret, getNextTokenIndexFromCaret } from './caretMap.js';
import { getCaretAfterDelete, getCaretAfterInsertion, findDeleteTargetToken } from './caretBehavior.js';



export function handleInputClick(input, clickedRange){
  const tokens = tokenize(input.textContent);
  const currentToken = getTokenAtCaret(tokens, clickedRange.offset);
  const nextToken = getNextToken(tokens, currentToken);

  let finalOffset = clickedRange.offset;

  if (currentToken?.type === 'function') {
    finalOffset = currentToken.start;
  }
  if (currentToken?.type === 'operator') {
    finalOffset = nextToken?.start;
  }

  return finalOffset;
}


export function handleAC(){
  return{
    newInput: '',
    newCaret: 0, 
    showMsg: true,
  }
}


export function handleDelete(inputText, caretPosition, btn){
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);
  
  const { map: inputMapForCaretMove } = formatTokensForDisplay(inputText);
  
  const currTokenIndex = getCurrTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const nextTokenIndex = getNextTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);

  const { start, end } = getDeleteRange(
    normalizedToken,
    tokenInd,
    currentToken,
    nextToken,
    caretPosition
  );

  const newInput =
    inputText.slice(0, start) +
    inputText.slice(end);

  const newCaret = start;

  return {
    newInput,
    newCaret,
    showMsg: true,
  };
}


function getDeleteRange(tokens, targetTokenIndex, currToken, nextToken, caretPos) {
  const token = tokens[targetTokenIndex];

  if (!token) {
    return {
      start: Math.max(caretPos - 1, 0),
      end: caretPos,
    };
  }

  if (nextToken?.type === 'operator') {
    const spaceLen = 1;
    nextToken.start -= spaceLen;
    nextToken.end += spaceLen;
  }

  if ((token.type === 'number' || token.type === 'parenClose' || token.type === 'supAndSub' || token.type === 'subscriptValue') && currToken?.type === 'parenOpen') {
    return {
      start: token.end,
      end: nextToken?.end ?? caretPos
    }
  }


  const valueTokenTypes = new Set([
    'number',
    'numberWithDecimal',
    'constant',
    'operator',
    'numWithPi',
    'numWithE',
    'superscriptValue',
    'subscriptValue',
    'supAndSub',
  ]);


  const isValueToken = valueTokenTypes.has(token.type);
  const isSpecialInlineValue =
    token.type === 'combAndPerm' ||
    token.value === decimal ||
    token.value === minus;

  const case1 =
    isValueToken && currToken.type === 'parenClose';

  const case2 =
    (isValueToken || isSpecialInlineValue) &&
    caretPos > token.start &&
    caretPos <= token.end;

  const case3 = (token.type === 'numWithPi' || token.type === 'numWithE') && 
    caretPos >= token.end;

  if (case1) {
    return {
      start: token.end - 1,
      end: token.end,
    }
  }

  if (case2 || case3) {
    return {
      start: caretPos - 1,
      end: caretPos,
    }
  }

  // default: whole token
  return {
    start: token.end,
    end: nextToken?.start ?? caretPos
  };
}



export function handleFunctions(value, inputText, btn, caretPosition){
  const insertValue = `${value}()`;

  const newInput = insertAt(inputText, caretPosition, insertValue);
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
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

export function handleLeftArrow(inputText, caretPosition, btn){
  const newInput = formatTokensForDisplay(inputText).text;
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}


export function handleRightArrow(inputText, caretPosition, btn){
  const newInput = formatTokensForDisplay(inputText).text;
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}

