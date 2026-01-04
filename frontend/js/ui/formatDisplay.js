import { getTokens, tokenValues } from '../core/tokenHelpers.js';
import { operatorsSet } from '../core/constants.js';

// export function formatTokens(inputText) {
//   const tokensObj = getTokens(inputText);
//   const tokens = tokenValues(tokensObj);

//   // const operators = new Set(['+', '-', '×', '/']);

//   let result = '';

//   for (let i = 0; i < tokens.length; i++) {
//     const curr = tokens[i];
//     const prev = tokens[i - 1];

//     // Space before operator (except at start)
//     if (operatorsSet.has(curr) && i !== 0) {
//       result += ' ';
//     }

//     // Space after operator
//     result += curr;

//     if (operatorsSet.has(curr)) {
//       result += ' ';
//     }

//     // No spaces around parentheses or function calls
//   }

//   return result.trim();
// }


export function formatTokensForDisplay(inputText) {
  const tokensObj = getTokens(inputText);
  const tokens = tokenValues(tokensObj);

  // const operators = new Set(['+', '-', '×', '÷', '^']);

  let text = '';
  const map = []; // displayIndex → tokenIndex

  let displayIndex = 0;

  for (let i = 0; i < tokens.length; i++) {
    const curr = tokens[i];

    if (operatorsSet.has(curr) && i !== 0) {
      text += ' ';
      map[displayIndex++] = i;
    }

    text += curr;
    map[displayIndex++] = i;

    if (operatorsSet.has(curr)) {
      text += ' ';
      map[displayIndex++] = i;
    }
  }

  return { text: text.trim(), map };
}


export function getTokenIndexFromCaret(map, caretPos) {
  return map[Math.min(caretPos, map.length - 1)];
}


export function getCaretForToken(map, tokenIndex, place = 'after') {
  if (place === 'before') {
    return map.findIndex(i => i === tokenIndex);
  }

  // after token
  for (let i = map.length - 1; i >= 0; i--) {
    if (map[i] === tokenIndex) return i + 1;
  }

  return map.length;
}

