import { getTokens } from '../core/tokenHelpers.js';
import {
  expBox,
  operatorsSet,
  trigFunctions,
  logFunctionsArr,
  logFunctions,
  combinatoricsArr,
  multiplicationDot
} from '../core/constants.js';

import { normalizeTokens } from '../core/normalizeTokens.js';



export function formatTokensForDisplay(inputText) {
  const tokensObj = getTokens(inputText);
  const normalized = normalizeTokens(tokensObj);

  let text = '';
  const map = []; // displayIndex → tokenIndex

  let displayIndex = 0;

  for (let i = 0; i < normalized.length; i++) {
    const curr = normalized[i];
    const prev = i > 0 ? normalized[i - 1] : null;
    
    const currValue = curr?.value != null
        ? String(curr.value)
        : String(curr?.raw);

    const prevValue = prev?.value != null 
      ? String(prev.value)
      : String(prev?.raw);


    if (((operatorsSet.has(currValue)) && i !== 0 && prev?.type !== 'parenOpen')) {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }

    if ((trigFunctions.includes(currValue) || logFunctionsArr.includes(currValue)) && !(operatorsSet.has(prevValue)) && i !== 0) {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }

    let htmlText = '';
    if (currValue === expBox && (prevValue === logFunctions.log || combinatoricsArr.includes(prevValue))) {
      htmlText = renderSub(currValue);
    }
    else if (currValue === expBox) {
      htmlText = renderSup(currValue);
    } else {
      htmlText = currValue;
    }
    text += htmlText;

    // Map visible characters only
    const visibleLength = htmlText.replace(/<[^>]*>/g, '').length;
    for (let j = 0; j < visibleLength; j++) {
      map[displayIndex++] = i;
    }

    if (operatorsSet.has(currValue) && i !== 0 && prev?.type !== 'parenOpen') {
      text += '&nbsp;';
      map[displayIndex++] = i;
    }
  }
  return { text: text, map };
}



function renderSup(token) {
  return `<sup>${token}</sup>`;
}

function renderSub(token) {
  return `<sub>${token}</sub>`;
}


