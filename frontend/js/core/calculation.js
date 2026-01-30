import {getTokens, tokenValues, normalizeUnaryMinus, insertImplicitMultiplication } from "./tokenHelpers.js";
import { toPostfix, evaluatePostfix } from "./postfix.js";
import { toScientific, shouldUseScientific } from "./mathHelpers.js";



/**
 * Evaluates a mathematical expression string and returns a formatted result.
 *
 * The expression is tokenized, normalized (implicit multiplication and unary minus),
 * converted to postfix notation, evaluated, and finally formatted for display.
 *
 * @param {string} expr - The mathematical expression to evaluate.
 * @returns {string} The computed result as a formatted string, or "Math Error" if invalid.
 */

export function calculate(expr) {
  const tokensObj = getTokens(expr);
  const ImplicitMultiplicationTokens = insertImplicitMultiplication(tokensObj);
  const tokens = tokenValues(ImplicitMultiplicationTokens);
  const unaryMinusTokens = normalizeUnaryMinus(tokens);
  const postfix = toPostfix(unaryMinusTokens);
  const result = evaluatePostfix(postfix);
  return showResult(result);
}



/**
 * Formats a numeric calculation result for display.
 *
 * Handles invalid values, applies scientific notation when needed,
 * and trims unnecessary trailing zeros.
 *
 * @param {number} result - The raw numeric result of evaluation.
 * @returns {string} A user-friendly formatted result.
 */

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


