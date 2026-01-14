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

    if ((trigFunctions.includes(curr) || logFunctionsArr.includes(curr)) && !(operatorsSet.has(prev))) {
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



// Caret movement is button-driven.
// Structural buttons (box/root/etc) intentionally keep caret at current token boundary.
// Token atomicity is enforced at the button level, not token level.
function shouldMoveToNextToken(inputText, map, btn, caretPos) {
  const tokensObj = getTokens(inputText);
  const normalizedToken = normalizeTokens(tokensObj);
  console.log(tokensObj);
  console.log(normalizedToken);

  const currTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const currentToken = currTokenIndex === -1 ? null : normalizedToken[currTokenIndex];
  
  const nextTokenIndex = getNextTokenIndexFromCaret(map, caretPos);
  const nextToken = nextTokenIndex === -1 ? null : normalizedToken[nextTokenIndex];

  const greaterNextTokenIndex = getGreaterNextTokenIndexFromCaret(map, caretPos);
  const greaterNextToken = greaterNextTokenIndex === -1 ? null : normalizedToken[greaterNextTokenIndex];

  console.log(getCurrTokenIndexFromCaret(map, caretPos));
  console.log(getNextTokenIndexFromCaret(map, caretPos));
  console.log(getGreaterNextTokenIndexFromCaret(map, caretPos));
  console.log(currentToken, nextToken, greaterNextToken);

  // console.log(newValue);
  // const { type } = classifyButtonValue(newValue);
  const { type } = classifyButton(btn);
  console.log(type, currentToken?.type, nextToken?.type, greaterNextToken?.type);

  if (
      (type === 'rightArrow' && (currentToken?.type === 'number' || currentToken?.type === 'numberWithDecimal') && !isAtEndOfCurrentToken(map, caretPos)) || 
      (type === 'rightArrow' && nextToken?.type === 'numberWithDecimal') || 
      (type === 'rightArrow' && currentToken?.type === 'parenOpen' && nextToken?.type === 'number') || 
      (type === 'rightArrow' && (currentToken?.type === 'numWithPi' || currentToken?.type === 'numWithE') && !isAtEndOfCurrentToken(map, caretPos)) || 
      (type === 'rightArrow' && (nextToken?.type === 'numWithPi' || nextToken?.type === 'numWithE' || nextToken?.type === 'constant')) || 
      (type === 'rightArrow' && currentToken?.type === 'operator' && nextToken?.type === 'number') || 
      (type === 'rightArrow' && currentToken?.type === 'singleRoot' && nextToken?.type === 'number') ) {
        return { move: 'char' }; 
  }

  if (
      (type === 'number' && currentToken?.type === 'number') || 
      (type === 'number' && currentToken?.type === 'subscriptValue') || 
      (type === 'logWithBox' && currentToken?.type === 'function') || 
      (type === 'baseWithSupers' && currentToken?.type === 'supAndSub') || 
      (type === 'number' && currentToken?.type === 'supAndSub') || 
      (type === 'number' && currentToken?.type === 'superscriptValue') || 
      (type === 'number' && currentToken?.type === 'nthRoot') || 
      (type === 'number' && currentToken?.type === 'numberWithDecimal') || 
      (type === 'pi' && currentToken?.type === 'numWithPi') || 
      (type === 'E' && currentToken?.type === 'numWithE') || 
      type === 'baseWithBox' || 
      type === 'boxWithRoot' || 
      type === 'combOrPerm' || 
      type === 'superscriptValue') {
        console.log(type, currentToken?.type);
        return { move: 'current' };
  }

  if ((type === 'rightArrow' && currentToken?.type === 'operator' && nextToken?.type === 'function') || type === 'function') {
    console.log('hello');
    return { move: 'greaterNext' };
  }

  return { move: 'next' };
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
  console.log(map);
  const currentTokenIndex = getCurrTokenIndexFromCaret(map, caretPos);
  const moveType = shouldMoveToNextToken(inputText, map, btn, caretPos).move;

  let targetTokenIndex = currentTokenIndex;
  console.log(targetTokenIndex);

  if (moveType === 'char') {
    return Math.min(caretPos + 1, map.length);
  }
  if (moveType === 'current') {
    console.log('hello');
    targetTokenIndex = currentTokenIndex;
  }
  if (moveType === 'next') {
    console.log('hello2');
    targetTokenIndex += 1;
  }
  if (moveType === 'greaterNext') {
    console.log('hello3');
    targetTokenIndex += 2;
    console.log(targetTokenIndex);
  }

  console.log(targetTokenIndex);
  const newCaretPosition = getCaretAfterToken(map, targetTokenIndex);
  console.log(newCaretPosition);
  console.log(map, currentTokenIndex, targetTokenIndex, newCaretPosition);
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
  console.log(result);
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
