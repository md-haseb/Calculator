import { getTokens } from '../core/tokenHelpers.js';
import { classifyButton } from '../core/classifyBtn.js';
import { percent, factorial } from '../core/constants.js';

import {
  getCurrTokenIndexFromCaret,
  getPrevTokenIndexFromCaret,
  getGreaterPrevTokenIndexFromCaret,
  getNextTokenIndexFromCaret,
  getGreaterNextTokenIndexFromCaret,
  getCaretAfterToken,
  isAtEndOfCurrentToken
} from './caretMap.js';

import { normalizeTokens } from '../core/normalizeTokens.js';



const deleteStartTokens = new Set([
  'parenOpen',
  'parenClose',
  'operator',
  'constant',
  'singleRoot',
  'nthRoot'
]);

const deleteTargetTypes = new Set([
  'number',
  'numberWithDecimal',
  'numWithPi',
  'numWithE',
  'constant',
  'parenOpen',
  'parenClose',
  'supAndSub'
]);

export function findDeleteTargetToken(normalizedToken, map, caretPos) {
  // const tokensObj = getTokens(inputText);
  // const normalizedToken = normalizeTokens(tokensObj);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const prevTokenIndex = getPrevTokenIndexFromCaret(map, caretPos);
  const prevToken = prevTokenIndex === -1 ? null : normalizedToken[prevTokenIndex];

  let targetTokenIndex = currTokenIndex;

  if(deleteStartTokens.has(currentToken?.type) || (currentToken?.type === 'number' && String(currentToken?.value).length == 1 && prevToken?.type === 'operator')) {
    for(let i = currTokenIndex - 1; i >= 0; i--) {
      if((currentToken?.type === 'parenClose') && (normalizedToken[i]?.type === 'parenClose')) {
        continue;
      }
      if(deleteTargetTypes.has(normalizedToken[i]?.type) || normalizedToken[i]?.value === percent || normalizedToken[i]?.value === factorial || (normalizedToken[i]?.type === 'subscriptValue' && normalizedToken[i - 1]?.type === 'combAndPerm')) {
        targetTokenIndex = i;
        return targetTokenIndex;
      }
    }
  }
  return targetTokenIndex;
}


export function getCaretAfterDelete(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const newNormalizedToken = normalizeTokens(tokensObj);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : newNormalizedToken[currTokenIndex];

  const { type } = classifyButton(btn);

  if(type === 'delete') {
    const targetTokenIndex = findDeleteTargetToken(newNormalizedToken, map, caretPos);

    // 1. Special structural deletes
    if(currentToken?.type === 'parenClose') {
      return Math.max(caretPos - 2, 0);
    }
    // 2. Semantic delete jump
    if(targetTokenIndex !== currTokenIndex) {
      return getCaretAfterToken(map, targetTokenIndex);
    }
    // 3. Fallback: single char delete
    return Math.max(caretPos - 1, 0);
  }
}


function shouldMoveToPrevToken(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];

  const prevTokenIndex = getPrevTokenIndexFromCaret(map, caretPos);
  const prevToken = prevTokenIndex === -1 ? null : normalizedToken[prevTokenIndex];

  const greaterPrevTokenIndex = getGreaterPrevTokenIndexFromCaret(map, caretPos);
  const greaterPrevToken = greaterPrevTokenIndex === -1 ? null : normalizedToken[greaterPrevTokenIndex];

  const { type } = classifyButton(btn);
  console.log(currentToken, prevToken, greaterPrevToken);
  console.log(currTokenIndex, prevTokenIndex, greaterPrevTokenIndex);

  // 🔹 Move inside token (char-left)
  const shouldMoveCharLeft =
    // type === 'leftArrow' &&
    // caretPos > 0 &&
    // map[caretPos - 1] === map[caretPos - 2];
    // type === 'leftArrow' && 
    // ((currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal')) || 
    // ((currentToken?.type === 'numWithPi' || currentToken?.type === 'numWithE'));
    type === 'leftArrow' && (currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal' || currentToken?.type === 'numWithPi' || currentToken?.type === 'numWithE' || currentToken?.type === 'supAndSub' || currentToken?.type === 'superscriptValue' || currentToken?.type === 'subscriptValue');

  // 🔹 Stay on current token
  // const shouldStayOnCurrentToken =
  //   type === 'number' ||
  //   type === 'baseWithBox' ||
  //   type === 'boxWithRoot' ||
  //   type === 'combOrPerm' ||
  //   type === 'superscriptValue';

  // 🔹 Skip back over function/operator
  const shouldMoveToGreaterPrev =
    type === 'leftArrow' &&
    (currentToken?.type === 'parenOpen' && prevToken?.type === 'function') || 
    (currentToken?.type === 'subscriptValue' && prevToken?.type === 'function');

  if (shouldMoveCharLeft) {
    return { move: 'char' };
  }

  // if (shouldStayOnCurrentToken) {
  //   return { move: 'current' };
  // }

  if (shouldMoveToGreaterPrev) {
    return { move: 'greaterPrev' };
  }

  return { move: 'prev' };
}



// Caret movement is button-driven.
// Structural buttons (box/root/etc) intentionally keep caret at current token boundary.
// Token atomicity is enforced at the button level, not token level.
function shouldMoveToNextToken(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);
  // console.log(tokensObj);
  // console.log(normalizedToken);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];
  
  const nextTokenIndex = getNextTokenIndexFromCaret(map, caretPos);
  const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  const greaterNextTokenIndex = getGreaterNextTokenIndexFromCaret(map, caretPos);
  const greaterNextToken = greaterNextTokenIndex === -1 ? null : normalizedToken[greaterNextTokenIndex];

  console.log(getCurrTokenIndexFromCaret(map, caretPos));
  // console.log(getNextTokenIndexFromCaret(map, caretPos));
  // console.log(getGreaterNextTokenIndexFromCaret(map, caretPos));
  // console.log(currentToken, nextToken, greaterNextToken);

  // console.log(newValue);
  // const { type } = classifyButtonValue(newValue);
  const { type } = classifyButton(btn);
  console.log(type, currentToken?.type, currentToken, nextToken?.type, greaterNextToken?.type);


  const shouldMoveCharRight =
  type === 'number' && 
    (currentToken?.type === 'number' || 
    currentToken?.type === 'superscriptValue' || 
    currentToken?.type === 'supAndSub' || 
    currentToken?.type === 'subscriptValue' || 
    currentToken?.type === 'numberWithDecimal' || 
    nextToken?.type === 'superscriptValue' || 
    nextToken?.type === 'subscriptValue' || 
    nextToken?.type === 'number' || 
    nextToken?.type === 'numberWithDecimal') || 
  type === 'rightArrow' && (
    (currentToken === null && nextToken?.type === 'number') || 
    (
      (currentToken?.type === 'number' ||
      currentToken?.type === 'numberWithDecimal' || 
      currentToken?.type === 'superscriptValue' || 
      currentToken?.type === 'subscriptValue' || 
      currentToken?.type === 'supAndSub') &&
      !isAtEndOfCurrentToken(map, caretPos)
    ) ||

    nextToken?.type === 'numberWithDecimal' ||

    nextToken?.type === 'superscriptValue' || 

    nextToken?.type === 'subscriptValue' || 

    nextToken?.type === 'supAndSub' || 

    (currentToken?.type === 'parenOpen' &&
     nextToken?.type === 'number') ||

    (
      (currentToken?.type === 'numWithPi' ||
       currentToken?.type === 'numWithE') &&
      !isAtEndOfCurrentToken(map, caretPos)
    ) ||

    (
      nextToken?.type === 'numWithPi' ||
      nextToken?.type === 'numWithE' ||
      nextToken?.type === 'constant'
    ) ||

    (currentToken?.type === 'operator' &&
     nextToken?.type === 'number') ||

    (currentToken?.type === 'singleRoot' &&
     nextToken?.type === 'number')
  );


  const shouldStayOnCurrentToken =
  // (type === 'number' && (
  //   // currentToken?.type === 'number' ||
  //   // currentToken?.type === 'subscriptValue' ||
  //   // currentToken?.type === 'supAndSub' ||
  //   // currentToken?.type === 'superscriptValue' ||
  //   // currentToken?.type === 'nthRoot' ||
  //   // currentToken?.type === 'numberWithDecimal'
  // )) ||

  (type === 'logWithBox' && currentToken?.type === 'function') ||

  (type === 'baseWithSupers' && currentToken?.type === 'supAndSub') ||

  (type === 'pi' && currentToken?.type === 'numWithPi') ||

  (type === 'E' && currentToken?.type === 'numWithE') ||

  type === 'baseWithBox' ||
  type === 'boxWithRoot' ||
  type === 'combOrPerm';
  // type === 'superscriptValue';


  const shouldMoveToGreaterNext =
  (type === 'rightArrow' &&
    (currentToken === null || currentToken?.type === 'operator') &&
    nextToken?.type === 'function' && greaterNextToken?.type === 'parenOpen') ||
  type === 'function';


  if (shouldMoveCharRight) {
    return { move: 'char' }; 
  }

  if (shouldStayOnCurrentToken) {
    // console.log(type, currentToken?.type);
    return { move: 'current' };
  }


  if (shouldMoveToGreaterNext) {
    // console.log('hello');
    return { move: 'greaterNext' };
  }

  return { move: 'next' };
}


export function getCaretAfterInsertion (inputText, map, btn, caretPos) {
  const { type } = classifyButton(btn);

  if (type === 'leftArrow') {
    const moveType = shouldMoveToPrevToken(inputText, map, btn, caretPos).move;

    if (moveType === 'char') {
      return Math.max(caretPos - 1, 0);
    }

    let targetTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);

    if (moveType === 'prev') targetTokenIndex -= 1;
    if (moveType === 'greaterPrev') targetTokenIndex -= 2;

    console.log(getCaretAfterToken(map, targetTokenIndex));
    return getCaretAfterToken(map, targetTokenIndex);
  }



  // console.log(map);
  const currentTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const moveType = shouldMoveToNextToken(inputText, map, btn, caretPos).move;

  let targetTokenIndex = currentTokenIndex;
  // console.log(targetTokenIndex);

  if (moveType === 'char') {
    return Math.min(caretPos + 1, map.length);
  }
  if (moveType === 'current') {
    // console.log('hello');
    targetTokenIndex = currentTokenIndex;
  }
  if (moveType === 'next') {
    // console.log('hello2');
    targetTokenIndex += 1;
  }
  if (moveType === 'greaterNext') {
    // console.log('hello3');
    targetTokenIndex += 2;
    // console.log(targetTokenIndex);
  }

  // console.log(targetTokenIndex);
  const newCaretPosition = getCaretAfterToken(map, targetTokenIndex);
  // console.log(newCaretPosition);
  // console.log(map, currentTokenIndex, targetTokenIndex, newCaretPosition);
  return newCaretPosition;
}