import {getTokens, tokenValues, normalizeUnaryMinus, insertImplicitMultiplication } from "./tokenHelpers.js";
import { toPostfix, evaluatePostfix } from "./postfix.js";
import { toScientific, shouldUseScientific } from "./mathHelpers.js";

/**
 * Main function to calculate a string expression.
 * @param {string} expr - The expression to calculate.
 * @returns {string} Computed result as a string.
 */
// export function calculate(expr) {
//   const tokens = tokenValues(expr);
//   const unaryMinusTokens = normalizeUnaryMinus(tokens);
//   const ImplicitMultiplicationTokens = insertImplicitMultiplication(unaryMinusTokens);
//   console.log(ImplicitMultiplicationTokens);
//   const postfix = toPostfix(ImplicitMultiplicationTokens);
//   const result = evaluatePostfix(postfix);
//   console.log(result, typeof(result));
//   return showResult(result);
// }

export function calculate(expr) {
  const tokensObj = getTokens(expr);
  const ImplicitMultiplicationTokens = insertImplicitMultiplication(tokensObj);
  const tokens = tokenValues(ImplicitMultiplicationTokens);
  const unaryMinusTokens = normalizeUnaryMinus(tokens);
  const postfix = toPostfix(unaryMinusTokens);
  console.log(postfix);
  const result = evaluatePostfix(postfix);
  console.log(showResult(result));
  return showResult(result);
}

function showResult(result){
  if (!Number.isFinite(result)) {
    return 'Math Error';
  }

  if (shouldUseScientific(result)) {
    return toScientific(result);
  }

  return result
    .toPrecision(11)
    .replace(/\.?0+$/, '');
}


