import { getTokens, tokenValues, getTokenAtCaret } from '../core/tokenHelpers.js';
import { expBox, operatorsSet, trigFunctions, logFunctionsArr, logFunctions, combinatorics, combinatoricsArr, superscriptChars } from '../core/constants.js';
import { classifyButtonValue, classifyButton } from '../core/classifyBtn.js';

export function formatTokensForDisplay(inputText) {
  const tokensObj = getTokens(inputText);
  const tokens = tokenValues(tokensObj);
  console.log(tokens);
  const normalized = splitSuperscriptRootTokens(tokens, superscriptChars);
  console.log(normalized);

  let text = '';
  const map = []; // displayIndex → tokenIndex

  let displayIndex = 0;
  console.log(normalized);
  for (let i = 0; i < normalized.length; i++) {
    console.log(normalized[i]);
    console.log(displayIndex);
    const curr = String(normalized[i]);
    const prev = i > 0 ? String(normalized[i - 1]) : null;
    console.log(curr);

    if ((operatorsSet.has(curr)) && i !== 0) {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }

    if ((trigFunctions.includes(curr) || logFunctionsArr.includes(curr)) && !(operatorsSet.has(prev)) && i !== 0) {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }

    let htmlText = '';
    if (curr === expBox && (prev === logFunctions.log || combinatoricsArr.includes(prev))) {
      htmlText = renderSub(curr);
    }
    else if (curr === expBox) {
      htmlText = renderSup(curr);
    } else {
      htmlText = curr;
    }
    text += htmlText;

    // Map visible characters only
    const visibleLength = htmlText.replace(/<[^>]*>/g, '').length;
    console.log(visibleLength);
    for (let j = 0; j < visibleLength; j++) {
      map[displayIndex++] = i;
    }

    if (operatorsSet.has(curr)) {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }
  }
  console.log(displayIndex);
  return { text: text, map };
}



function getCurrTokenIndexFromCaret(map, caretPos) {
  if (caretPos <= 0) return -1;
  const i = Math.min(caretPos - 1, map.length - 1);
  return map[i];
}

function getPrevTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos - 2; i >= 0; i--) {
    if (map[i] !== current) {
      return map[i];
    }
  }
  return -1;
}

function getGreaterPrevTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);
  const prev = getPrevTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos - 2; i >= 0; i--) {
    if (map[i] !== current && map[i] !== prev) {
      return map[i];
    }
  }
  return -1;
}


function getNextTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos; i < map.length; i++) {
    if (map[i] !== current) {
      return map[i];
    }
  }
  return -1;
}

function getGreaterNextTokenIndexFromCaret(map, caretPos) {
  const current = getCurrTokenIndexFromCaret(map, caretPos);
  const next = getNextTokenIndexFromCaret(map, caretPos);

  for (let i = caretPos; i < map.length; i++) {
    if (map[i] !== current && map[i] !== next) {
      return map[i];
    }
  }
  return -1;
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
    type === 'leftArrow' && 
    ((currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal')) || 
    ((currentToken?.type === 'numWithPi' || currentToken?.type === 'numWithE'));

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
    nextToken?.type === 'subscriptValue') || 
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


function isAtStartOfCurrentToken(map, caretPos) {
  if (caretPos <= 0) return true; // caret at very beginning is start of token

  const idx = caretPos - 1;
  const curr = map[idx];
  const prev = map[idx - 1];

  // previous display index belongs to a different token
  return prev !== curr;
}

function isAtEndOfCurrentToken(map, caretPos) {
  if (caretPos <= 0) return false;

  const idx = caretPos - 1;
  const curr = map[idx];
  const next = map[idx + 1];

  // next display index belongs to a different token
  return next !== curr;
}



function getCaretAfterToken(map, targetTokenIndex) {
  if (targetTokenIndex < 0) return 0;

  let lastIndex = -1;
  
  for (let i = 0; i < map.length; i++) {
    if (map[i] === targetTokenIndex) {
      lastIndex = i;
    }
  }
  
  return lastIndex === -1 ? 0 : lastIndex + 1;
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



function renderSup(token) {
  return `<sup>${token}</sup>`;
}

function renderSub(token) {
  return `<sub>${token}</sub>`;
}

function splitSuperscriptRootTokens(tokens, superscriptChars) {
  const result = [];
  const supRegex = new RegExp(`^[${superscriptChars}]+√$`);

  for (const token of tokens) {
    if (typeof token === 'string' && supRegex.test(token)) {
      const supPart = token.slice(0, -1); // remove √
      result.push(supPart, '√');
    } else {
      result.push(token);
    }
  }
  // console.log(result);
  return result;
}


function normalizeTokens(tokens) {
  const result = [];

  for (const token of tokens) {
    if (token.type !== 'nthRoot') {
      result.push(token);
      continue;
    }

    const { raw, start } = token;

    // 1️⃣ extract superscripts (everything except √)
    const superscript = raw.replace('√', '');

    if (superscript.length > 0) {
      result.push({
        type: 'superscriptValue',
        value: superscript,
        start: start,
        end: start + superscript.length
      });
    }

    // 2️⃣ root symbol
    result.push({
      type: 'singleRoot',
      value: '√',
      start: start + superscript.length,
      end: start + raw.length
    });
  }

  return result;
}
