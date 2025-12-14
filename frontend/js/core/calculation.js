import {tokenValues} from "./tokenHelpers.js";
import { toPostfix, evaluatePostfix } from "./postfix.js";
import { toScientific, shouldUseScientific } from "./mathHelpers.js";

/**
 * Main function to calculate a string expression.
 * @param {string} expr - The expression to calculate.
 * @returns {string} Computed result as a string.
 */
export function calculate(expr) {
  const tokens = tokenValues(expr);
  const postfix = toPostfix(tokens);
  const result = evaluatePostfix(postfix);

  if (shouldUseScientific(result)) {
    return toScientific(result);
  } else {
    return result.toString();
  }
}


