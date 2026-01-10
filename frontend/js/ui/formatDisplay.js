import { getTokens, tokenValues, getTokenAtCaret } from '../core/tokenHelpers.js';
import { expBox, operatorsSet, trigFunctions, logFunctionsArr, logFunctions, combinatorics, combinatoricsArr, superscriptChars } from '../core/constants.js';
import { classifyButtonValue } from '../core/classifyBtn.js';

export function formatTokensForDisplay(inputText) {
  const tokensObj = getTokens(inputText);
  const tokens = tokenValues(tokensObj);
  console.log(tokens);
  const normalized = splitSuperscriptRootTokens(tokens, superscriptChars);
  console.log(normalized);

  // const operators = new Set(['+', '-', '×', '÷', '^']);

  let text = '';
  const map = []; // displayIndex → tokenIndex

  let displayIndex = 0;
  console.log(tokens);
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
    // Render token HTML
    // const htmlToken = renderTokenHTML(curr);
    // text += curr;

    // Map visible characters only
    const visibleLength = htmlText.replace(/<[^>]*>/g, '').length;
    console.log(visibleLength);
    for (let j = 0; j < visibleLength; j++) {
      map[displayIndex++] = i;
    }

    // if (curr === expBox) {
    //   text += `<sup>${curr}</sup>`;
    // } else {
    //   text += curr;
    // }

    // // text += curr;
    // console.log(curr.length);
    // for (let j = 0; j < curr.length; j++) {
    //   map[displayIndex++] = i;
    // }

    if (operatorsSet.has(curr)) {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }
  }
  console.log(displayIndex);
  return { text: text, map };
}


// export function formatTokensForDisplay(inputText) {
//   const tokensObj = getTokens(inputText);
//   const tokens = tokenValues(tokensObj);

//   let text = '';
//   const map = [];
//   let displayIndex = 0;
//   console.log(tokensObj);
//   for (let i = 0; i < tokensObj.length; i++) {
//     const curr = String(tokensObj[i].value);
//     const prev = i > 0 ? String(tokensObj[i - 1]) : null;
//     console.log(curr, prev);

//     // Add space before token ONLY if previous token is an operator
//     if (i !== 0 && (operatorsSet.has(prev.value) || prev.type === 'number')) {
//       text += '&nbsp;';
//       map[displayIndex++] = i;
//       // do NOT map this display-only space
//     }

//     // Add the token itself
//     text += curr;
//     for (let j = 0; j < curr.length; j++) {
//       map[displayIndex++] = i;
//     }

//     // Add space after operator if next token is not a function or parentheses
//     if (operatorsSet.has(curr)) {
//       const next = i + 1 < tokens.length ? String(tokens[i + 1]) : null;
//       if (!trigFunctions.includes(next) && next !== '(') {
//         text += '&nbsp;';
//         map[displayIndex++] = i;
//         // do NOT map this display-only space
//       }
//     }
//   }

//   return { text, map };
// }


function getTokenIndexFromCaret(map, caretPos) {
  if (caretPos <= 0) return -1;

  const displayIndex = Math.min(caretPos - 1, map.length - 1);
  return map[displayIndex];
}

// function getCurrentTokenFromCaret(map, caretPos) {
//   const displayIndex = Math.min(caretPos - 1, map.length - 1);

// }



// function shouldMoveToNextToken(newValue) {
//   const { type } = classifyButtonValue(newValue);
//   console.log(type);

//   return (
//     type === 'plus' ||
//     type === 'minus' || 
//     type === 'multiply' || 
//     type === 'divide' || 
//     type === 'parentheses' ||
//     type === 'function' ||
//     type === 'logWithBox' ||
//     type === 'baseWithSupers' ||
//     type === 'baseWithBox' || 
//     type === 'boxWithRoot' || 
//     type === 'combOrPerm'
//   );
// }
function shouldMoveToNextToken(inputText, map, newValue, caretPos) {
  const tokensObj = getTokens(inputText);
  // const currentToken = getTokenAtCaret(tokensObj, caretPos);
  console.log(tokensObj);
  const currentToken = tokensObj[getTokenIndexFromCaret(map, caretPos)];

  console.log(newValue);
  const { type } = classifyButtonValue(newValue);
  console.log(type, currentToken?.type);

  if ((type === 'number' && currentToken?.type === 'number') || (type === 'number' && currentToken?.type === 'nthRoot') || (type === 'number' && currentToken?.type === 'numberWithDecimal') || type === 'baseWithBox' || type === 'boxWithRoot' || type === 'combOrPerm' || type === 'superscriptValue') {
    console.log(type, currentToken?.type);
    return { move: 'current' };
  }
  if (type === 'function') {
    return { move: 'greaterNext' };
  }
  return { move: 'next' };

  // return (
  //   type === 'plus' ||
  //   type === 'minus' || 
  //   type === 'multiply' || 
  //   type === 'divide' || 
  //   type === 'parentheses' ||
  //   type === 'function' ||
  //   type === 'logWithBox' ||
  //   type === 'baseWithSupers' ||
  //   type === 'baseWithBox' || 
  //   type === 'boxWithRoot' || 
  //   type === 'combOrPerm'
  // );
}


function getCaretAfterToken(map, targetTokenIndex) {
  let lastIndex = -1;
  
  for (let i = 0; i < map.length; i++) {
    if (map[i] === targetTokenIndex) {
      lastIndex = i;
    }
  }
  
  return lastIndex === -1 ? 0 : lastIndex + 1;
}



export function getCaretAfterInsertion (inputText, map, newValue, caretPos) {
  console.log(map);
  const currentTokenIndex = getTokenIndexFromCaret(map, caretPos);

  let targetTokenIndex = currentTokenIndex;
  console.log(targetTokenIndex);

  const moveType = shouldMoveToNextToken(inputText, map, newValue, caretPos).move;
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
