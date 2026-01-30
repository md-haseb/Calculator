import { superscriptChars, subscriptChars, root } from "./constants.js";
import { extractDegree } from "./mathHelpers.js";




/**
 * Tokenizes a mathematical expression string into an array of structured token objects.
 *
 * This function parses the input expression and classifies each substring as a specific token type,
 * including:
 *   - Numbers (integer, decimal, with superscripts/subscripts)
 *   - Constants (π, e)
 *   - Numbers multiplied by constants (e.g., 2π, 3e)
 *   - Operators (+, -, *, /, %, !, √, etc.)
 *   - Functions (sin, cos, tan, cot, sec, csc, log, ln)
 *   - Roots (single √ or nth roots like ³√)
 *   - Parentheses, boxes (□) for exponents/indices
 *   - Combinatorics symbols (C, P)
 * 
 * Each token object includes:
 *   - `type`      : The type of token (e.g., "number", "operator", "function", etc.)
 *   - `value` or `raw` : The literal string or parsed value of the token
 *   - `start`     : Start index of the token in the original expression
 *   - `end`       : End index of the token in the original expression
 *
 * Regexes are precompiled to improve performance and clarity.
 * The function handles edge cases like superscripts, subscripts, and numbers with π or e.
 *
 * @param {string} expr - The mathematical expression to tokenize.
 * @returns {Array<Object>} Array of token objects representing the parsed expression.
 */

export function tokenize(expr){

  const tokens = [];

  // ---- Precompile regexes (for performance & clarity) ----
  const tokenRegEx = new RegExp(`(?:sin|cos|tan|cot|sec|csc|log|ln|C|P|□|π|e|⋅|×)` +                  // functions
  `|(?:\\d+(?:\\.\\d+)?e)` + //numbers with e
  `|(?:\\d+(?:\\.\\d+)?π)` + //numbers with pi
  `|[${superscriptChars}]+√` +  // nth-root operator like 3√, 7√
  `|(?:\\d+\\.\\d+|\\d+|\\.\\d*)(?=[${superscriptChars}${subscriptChars}]+[CP√])` + //NUMBER before C / P
  `|(?:\\d+\\.\\d+|\\d+|\\.\\d*)[${superscriptChars}${subscriptChars}]*` + // numbers with optional super/subscripts
  // `|(?:\\d+\\.\\d+|\\d+|\\.\\d*)` + //normal number
  `|[${superscriptChars}]+` + // consecutive standalone super/subscripts
  `|[${subscriptChars}]+` +
  // `|[+\\-*/√%!()]`,                           // operators
  `|[+\\-*%√!()]|(?<!<[^>]*)/(?![^<]*>)`,
  'g');

  // console.log(expr.match(tokenRegEx));
  // return expr.match(tokenRegEx);
  // const rawTokens = expr.match(tokenRegEx) || [];

  // Classification regexes
  const reNthRoot      = new RegExp(`[${superscriptChars}]+√`); 
  const reSuperscript  = new RegExp(`^[${superscriptChars}]+$`);
  const reSubscript    = new RegExp(`^[${subscriptChars}]+$`);
  const reSuperSubNum  = new RegExp(`\\d+(?:\\.\\d+)?[${superscriptChars}${subscriptChars}]+`);
  const reDecimal      = /^\d*\.\d+$/;
  const reInteger      = /^\d+$/;
  const reOperator     = /[+\-*×⋅/%!]/;
  const numWithPi      = /\d+(?:\.\d+)?π/;
  const numWithE       = /\d+(?:\.\d+)?e/;

  let match;
  
  while ((match = tokenRegEx.exec(expr)) !== null) {
    const t = match[0];
    const start = match.index;
    const end = start + t.length;

    //function
    if (["sin", "cos", "tan", "cot", "sec", "csc", "log", "ln"].includes(t)) {
      tokens.push({ type: "function", value: t, start, end });
      continue;
    }
    //single root
    if (t === root) {
      tokens.push({ type: "singleRoot", degree: 2, raw: t, start, end }); // single √
      continue;
    }
    //nth root
    if (reNthRoot.test(t)) { 
      tokens.push({ type: "nthRoot", degree: extractDegree(t), raw: t, start, end }); // multi-digit root
      continue;
    }
    //permutation and combination
    if (t === "C" || t === "P") {
      tokens.push({ type: "combAndPerm", value: t, start, end });
      continue;
    }
    //constant
    if (t === 'π' || t === 'e'){
      tokens.push({ type: "constant", value: t, start, end });
      continue;
    }
    //number with PI
    if (numWithPi.test(t)) {
      tokens.push({ type: "numWithPi", value: t, start, end });
      continue;
    }
    if (numWithE.test(t)) {
      tokens.push({ type: "numWithE", value: t, start, end });
      continue;
    }
    //number with superscript and subscript number
    if (reSuperSubNum.test(t)){
      tokens.push({ type: "supAndSub", value: t, start, end });
      continue;
    }
    //standalone superscript number
    if (reSuperscript.test(t)){
      tokens.push({type: "superscriptValue", value: t, start, end });
      continue;
    }
    //standalone subscript number
    if (reSubscript.test(t)){
      tokens.push({type: "subscriptValue", value: t, start, end });
      continue;
    }
    //number with decimal number
    if (reDecimal.test(t)){
      tokens.push({ type: "numberWithDecimal", value: t, start, end }); //parseFloat(t)
      continue;
    }
    //number
    if (reInteger.test(t)) {
      tokens.push({ type: "number", value: parseFloat(t), start, end });
      continue;
    }
    //parentheses open and close
    if (t === "(") {
      tokens.push({type: "parenOpen", value: t, start, end });
      continue;
    }
    if (t === ")") {
      tokens.push({type: "parenClose", value: t, start, end });
      continue;
    }
    //box for exponents and indices
    if (t === "□") {
      tokens.push({ type: "box", value: t, start, end });
      continue;
    }
    //operators
    if (reOperator.test(t)) {
      tokens.push({ type: "operator", value: t, start, end });
      continue;
    }
    //unknown
    tokens.push({ type: "unknown", value: t, start, end });
  }

  console.log(tokens);
  return tokens;
}