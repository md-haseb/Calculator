import { superscriptChars, subscriptChars, root } from "./constants.js";
import { extractDegree } from "./mathHelpers.js";

// //string of superscript and subscript numbers
// const superscriptChars = Array.from(superscripts).join('');
// const subscriptChars = Array.from(subscripts).join('');

/**
 * Tokenizes a mathematical expression into an array of token objects.
 * @param {string} expr - The expression to tokenize.
 * @returns {Array<Object>} Array of token objects with type, value/raw, start, and end.
 */
export function tokenize(expr){

  const tokens = [];

  // ---- Precompile regexes (for performance & clarity) ----
  const tokenRegEx = new RegExp(`(?:sin|cos|tan|cot|sec|csc|log|ln|C|P|□|π|e|×)` +                  // functions
  `|[${superscriptChars}]+√` +  // nth-root operator like 3√, 7√
  `|(?:\\d+\\.\\d+|\\d+|\\.\\d*)[${superscriptChars}${subscriptChars}]*` + // numbers with optional super/subscripts
  `|[${superscriptChars}${subscriptChars}]+` + // consecutive standalone super/subscripts
  `|[+\\-*/√%!()]`,                           // operators
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
  const reOperator     = /[+\-*/%!]/;

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
      tokens.push({ type: "numberWithDecimal", value: parseFloat(t), start, end });
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