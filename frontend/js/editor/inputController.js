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
// normalizeTokens, getCurrTokenIndexFromCaret, getNextTokenIndexFromCaret, getGreaterNextTokenIndexFromCaret

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

// export function handleDelete(inputText, caretPosition, btn){
//   const tokensObj = getTokens(inputText);
//   const normalizedToken = normalizeTokens(tokensObj);
//   // console.log(tokensObj);
//   // console.log(normalizedToken);
//   // const currInputText = formatTokensForDisplay(inputText).text;
//   // const inputMapForCaretMove = formatTokensForDisplay(inputText).map;
//   const { text: currInputText, map: inputMapForCaretMove } = formatTokensForDisplay(inputText);
//   console.log(inputMapForCaretMove);
  
//   const currTokenIndex = getCurrTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
//   const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

//   const nextTokenIndex = getNextTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
//   const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

//   // const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
  
//   function getRawIndexFromToken(normalizedTokens, currToken, targetTokenIndex, side = 'start') {
//     if (targetTokenIndex < 0) return 0;
//     // tokenIndex = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);
//     const token = normalizedTokens[targetTokenIndex];

//     if (((token?.type === 'number' || token?.type === 'numberWithDecimal' || token?.type === 'superscriptValue' || token?.type === 'subscriptValue' || token?.type === 'supAndSub' || token?.type === 'numWithPi' || token?.type === 'numWithE' || token?.type === 'constant') && currToken?.type === 'parenClose') || ((token?.type === 'number' || token?.type === 'numberWithDecimal' || token?.type === 'numWithPi' || token?.type === 'numWithE' || token?.type === 'constant' || token?.type === 'supAndSub' || token?.type === 'superscriptValue' || token?.type === 'subscriptValue' || token?.type === 'combAndPerm' || token?.value === decimal || token?.value === minus) && targetTokenIndex === currTokenIndex)) {
//       return token.end - 1;
//     }

//     return side === 'start' ? token.start : token.end;
//   }


//   if(currentToken?.type === 'parenOpen' && nextToken?.type === 'parenClose') {
//     const afterSlice = nextToken.end;
//     const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);

//     const rawIndex = getRawIndexFromToken(
//       normalizedToken,
//       currentToken,
//       tokenInd,
//       'end'
//     );

//     const newInput = inputText.slice(0, rawIndex) + inputText.slice(afterSlice);
//     const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
//     // const newInput = inputText.slice(0, newCaret) + inputText.slice(afterSlice);
//     // console.log(normalizedToken);
//     // console.log(newCaret);
//     return{
//       newInput,
//       newCaret,
//       showMsg: true,
//     }
//   }

//   if(currentToken?.type === 'parenClose') {
//     const afterSliceForParenClose = currentToken.start;
//     const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);
//     console.log(tokenInd);

//     const rawIndex = getRawIndexFromToken(
//       normalizedToken,
//       currentToken,
//       tokenInd,
//       'end'
//     );

//     const newInput = inputText.slice(0, rawIndex) + inputText.slice(afterSliceForParenClose);
//     const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
//     // const newInput = inputText.slice(0, newCaret) + inputText.slice(afterSliceForParenClose);
//     // console.log(normalizedToken);
//     // console.log(newCaret);
//     return{
//       newInput,
//       newCaret,
//       showMsg: true,
//     }
//   }

//   //default
//   // const newInput = inputText.slice(0, newCaret) + inputText.slice(caretPosition);
//     const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);
//     console.log(tokenInd);

//     const rawIndex = getRawIndexFromToken(
//       normalizedToken,
//       currentToken,
//       tokenInd,
//       'end'
//     );

//     const newInput = inputText.slice(0, rawIndex) + inputText.slice(caretPosition);
//     const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
//     console.log(normalizedToken);
//     console.log(newCaret);
//     return{
//       newInput,
//       newCaret,
//       showMsg: true,
//     }
// }

export function handleDelete(inputText, caretPosition, btn){
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);
  // console.log(tokensObj);
  // console.log(normalizedToken);
  // const currInputText = formatTokensForDisplay(inputText).text;
  // const inputMapForCaretMove = formatTokensForDisplay(inputText).map;
  const { map: inputMapForCaretMove } = formatTokensForDisplay(inputText);
  console.log(inputMapForCaretMove);
  
  const currTokenIndex = getCurrTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const nextTokenIndex = getNextTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  // const nextTokenIndex = getNextTokenIndexFromCaret(inputMapForCaretMove, caretPosition);
  // const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  // const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
  
  // function getRawIndexFromToken(normalizedTokens, currToken, targetTokenIndex, side = 'start') {
  //   if (targetTokenIndex < 0) return 0;
  //   // tokenIndex = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);
  //   const token = normalizedTokens[targetTokenIndex];

  //   if (((token?.type === 'number' || token?.type === 'numberWithDecimal' || token?.type === 'superscriptValue' || token?.type === 'subscriptValue' || token?.type === 'supAndSub' || token?.type === 'numWithPi' || token?.type === 'numWithE' || token?.type === 'constant') && currToken?.type === 'parenClose') || ((token?.type === 'number' || token?.type === 'numberWithDecimal' || token?.type === 'numWithPi' || token?.type === 'numWithE' || token?.type === 'constant' || token?.type === 'supAndSub' || token?.type === 'superscriptValue' || token?.type === 'subscriptValue' || token?.type === 'combAndPerm' || token?.value === decimal || token?.value === minus) && targetTokenIndex === currTokenIndex)) {
  //     return token.end - 1;
  //   }

  //   return side === 'start' ? token.start : token.end;
  // }
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

  // if(currentToken?.type === 'parenOpen' && nextToken?.type === 'parenClose') {
  //   const afterSlice = nextToken.end;
  //   // const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);

  //   const rawIndex = getRawIndexFromToken(
  //     normalizedToken,
  //     currentToken,
  //     tokenInd,
  //     'end'
  //   );

  //   const newInput = inputText.slice(0, rawIndex) + inputText.slice(afterSlice);
  //   const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
  //   // const newInput = inputText.slice(0, newCaret) + inputText.slice(afterSlice);
  //   // console.log(normalizedToken);
  //   // console.log(newCaret);
  //   return{
  //     newInput,
  //     newCaret,
  //     showMsg: true,
  //   }
  // }

  // if(currentToken?.type === 'parenClose') {
  //   const afterSliceForParenClose = currentToken.start;
  //   // const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);
  //   console.log(tokenInd);

  //   const rawIndex = getRawIndexFromToken(
  //     normalizedToken,
  //     currentToken,
  //     tokenInd,
  //     'end'
  //   );

  //   const newInput = inputText.slice(0, rawIndex) + inputText.slice(afterSliceForParenClose);
  //   const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
  //   // const newInput = inputText.slice(0, newCaret) + inputText.slice(afterSliceForParenClose);
  //   // console.log(normalizedToken);
  //   // console.log(newCaret);
  //   return{
  //     newInput,
  //     newCaret,
  //     showMsg: true,
  //   }
  // }

  //default
  // const newInput = inputText.slice(0, newCaret) + inputText.slice(caretPosition);
    // const tokenInd = findDeleteTargetToken(normalizedToken, inputMapForCaretMove, caretPosition);
    // console.log(tokenInd);

    // const rawIndex = getRawIndexFromToken(
    //   normalizedToken,
    //   currentToken,
    //   tokenInd,
    //   'end'
    // );

    // const newInput = inputText.slice(0, rawIndex) + inputText.slice(caretPosition);
    // const newCaret = getCaretAfterDelete(inputText, inputMapForCaretMove, btn, caretPosition);
    // console.log(normalizedToken);
    // console.log(newCaret);
    // return{
    //   newInput,
    //   newCaret,
    //   showMsg: true,
    // }
}

function getDeleteRange(tokens, targetTokenIndex, currToken, nextToken, caretPos) {
  const token = tokens[targetTokenIndex];
  console.log(nextToken);

  if (!token) {
    return {
      start: Math.max(caretPos - 1, 0),
      end: caretPos,
    };
  }

  if (nextToken?.type === 'operator') {
    console.log('hello');
    const spaceLen = 1;
    nextToken.start -= spaceLen;
    nextToken.end += spaceLen;
  }

  if ((token.type === 'number' || token.type === 'parenClose' || token.type === 'supAndSub' || token.type === 'subscriptValue') && currToken?.type === 'parenOpen') {
    return {
      start: token.end,
      // end: currToken.end + 1
      end: nextToken?.end ?? caretPos
    }
  }

  // if (token.type === 'number' && currToken?.type === 'parenClose') {
  //   return {
  //     start: token.end - 1,
  //     // end: currToken.start
  //     end: token.end
  //   }
  // }

  // normal backspace inside numbers
  // if (
  //   ((token.type === 'number' || token.type === 'numberWithDecimal' || token.type === 'superscriptValue' || token.type === 'subscriptValue' || token.type === 'supAndSub' || token.type === 'numWithPi' || token.type === 'numWithE' || token.type === 'constant') && currToken.type === 'parenClose') || ((token.type === 'number' || token.type === 'numberWithDecimal' || token.type === 'numWithPi' || token.type === 'numWithE' || token.type === 'constant' || token.type === 'supAndSub' || token.type === 'superscriptValue' || token.type === 'subscriptValue' || token.type === 'combAndPerm' || token.value === decimal || token.value === minus) && targetTokenIndex === currTokenIndex)
  // ) {
  //   return {
  //     // start: caretPos - 1,
  //     // end: caretPos,
  //     start: token.end - 1,
  //     end: token.end,
  //   };
  // }

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
  // 'numWithPi',
  // 'numWithE',

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
    console.log('hello');
    return {
      start: token.end - 1,
      end: token.end,
    }
  }

  if (case2 || case3) {
    console.log('hello');
    return {
      start: caretPos - 1,
      end: caretPos,
      // start: token.end - 1,
      // end: token.end,
    }
  }

  console.log('hello', currToken.type, token.type);
  // default: whole token
  return {
    start: token.end,
    // end: currToken.end,
    end: nextToken?.start ?? caretPos
  };
}



// export function handleDelete(inputText, caretPosition){
//   const tokens = tokenize(inputText);
//   const currentToken = getTokenAtCaret(tokens, caretPosition);
//   const prevToken = getPrevToken(tokens, currentToken);
//   const nextToken = getNextToken(tokens, currentToken);

//   if(caretPosition === 0){
//     return{
//       newInput: inputText,
//       newCaret: 0,
//       showMsg: true,
//     }
//   }

//   if(currentToken.type === 'parenClose'){
//     return deleteForParens(inputText, caretPosition, currentToken);
//   }

//   if(currentToken.type === 'parenOpen' && prevToken.type === 'function'){
//     return deleteForFunction(inputText, caretPosition, prevToken, nextToken);
//   }

//   return deleteBeforeCaret(inputText, caretPosition);
// }

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
  console.log(newInput);
    return{
      newInput,
      newCaret: newInput.length,
      showMsg: true,
    }
}

export function handleLeftArrow(inputText, caretPosition, btn, btnValue){
  // const tokens = tokenize(inputText);
  // const currentToken = getTokenAtCaret(tokens, caretPosition);
  // const prevToken = getPrevToken(tokens, currentToken);

  // const currentTokenLen = currentToken?.value.length;
  // const prevTokenLength = prevToken?.value.length;
  // const charsToRemove = prevTokenLength + currentTokenLen;

  // const moveLeft = 1;

  // if(currentToken?.type === 'parenOpen' && prevToken?.type === 'function'){
  //   return{
  //     newInput: inputText,
  //     newCaret: caretPosition - charsToRemove,
  //     showMsg: true,
  //   }
  // }
  // return{
  //     newInput: inputText,
  //     newCaret: caretPosition - moveLeft,
  //     showMsg: true,
  // }
  const newInput = formatTokensForDisplay(inputText).text;
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}


export function handleRightArrow(inputText, caretPosition, btn, btnValue){
  // const tokens = tokenize(inputText);
  // const normalizedToken = normalizeTokens(tokens);
  // const currentToken = normalizedToken[getCurrTokenIndexFromCaret(map, caretPos)];
  // const nextToken = normalizedToken[getNextTokenIndexFromCaret(map, caretPos)];
  // const greaterNextToken = normalizedToken[getGreaterNextTokenIndexFromCaret(map, caretPos)];
  // const currentToken = getTokenAtCaret(tokens, caretPosition);
  // const nextToken = getNextToken(tokens, currentToken);
  // const greaterNextToken = getNextToken(tokens, nextToken);
  // const nextTokenLength = nextToken?.value.length;

  // const combOrPermTemp = makeCombPermTemplate(nextToken?.value);

  // const parenOpenLen = 1;
  // const moveRight = 1;
  // const charsToRemove = nextTokenLength + parenOpenLen;

  // if(nextToken?.type === 'function'){
  //   return{
  //     newInput: inputText,
  //     newCaret: caretPosition + charsToRemove,
  //     showMsg: true,
  //   }
  // }

  // if ((nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation) && greaterNextToken?.value === expBox) {
  //   return {
  //     newInput: showIndices(inputText, caretPosition, combOrPermTemp, nextToken, greaterNextToken),
  //     newCaret: caretPosition + moveRight,
  //     showMsg: true,
  //   }
  // }
  
  // return{
  //   newInput: inputText,
  //   newCaret: caretPosition + moveRight,
  //   showMsg: true,
  // }
  const newInput = formatTokensForDisplay(inputText).text;
  const inputMapForCaretMove = formatTokensForDisplay(newInput).map;
  return{
    newInput,
    newCaret: getCaretAfterInsertion(newInput, inputMapForCaretMove, btn, caretPosition),
    showMsg: true,
  }
}


// export function handleRightArrow(inputText, caretPosition){
//   const tokens = tokenize(inputText);
//   const currentToken = getTokenAtCaret(tokens, caretPosition);
//   const nextToken = getNextToken(tokens, currentToken);
//   const greaterNextToken = getNextToken(tokens, nextToken);
//   const nextTokenLength = nextToken?.value.length;

//   const combOrPermTemp = makeCombPermTemplate(nextToken?.value);

//   const parenOpenLen = 1;
//   const moveRight = 1;
//   const charsToRemove = nextTokenLength + parenOpenLen;

//   if(nextToken?.type === 'function'){
//     return{
//       newInput: inputText,
//       newCaret: caretPosition + charsToRemove,
//       showMsg: true,
//     }
//   }

//   if ((nextToken?.value === combinatorics.combination || nextToken?.value === combinatorics.permutation) && greaterNextToken?.value === expBox) {
//     return {
//       newInput: showIndices(inputText, caretPosition, combOrPermTemp, nextToken, greaterNextToken),
//       newCaret: caretPosition + moveRight,
//       showMsg: true,
//     }
//   }
  
//   return{
//       newInput: inputText,
//       newCaret: caretPosition + moveRight,
//       showMsg: true,
//     }
// }

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