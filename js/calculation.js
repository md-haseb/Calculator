import {operatorsSet, precedence, associativity, superscripts, subscripts, superscriptToNormal, subscriptToNormal, root, percent, factorial} from './constants.js';

import {getMode} from './ui.js';

//array of superscript and subscript number
const superscriptChars = Array.from(superscripts).join('');
const subscriptChars = Array.from(subscripts).join('');

/**
 * Tokenizes a mathematical expression into an array of token objects.
 * @param {string} expr - The expression to tokenize.
 * @returns {Array<Object>} Array of token objects with type, value/raw, start, and end.
 */
export function tokenize(expr){

  const tokens = [];

  // ---- Precompile regexes (for performance & clarity) ----
  const tokenRegEx = new RegExp(`(?:sin|cos|tan|log|ln|C|P|□|π|e)` +                  // functions
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
    if (["sin", "cos", "tan", "log", "ln"].includes(t)) {
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

/**
 * Converts a tokenized expression to postfix notation using Shunting Yard algorithm.
 * @param {Array} tokens - Array of token strings.
 * @returns {Array} Postfix array of tokens.
 */
export function toPostfix(tokens) {
  const output = [];
  const stack = [];

  for (let i = 0; i < tokens.length; i++) {
    //number, superscripted number, percent, factorial > push to the output stack
    if (!isNaN(tokens[i]) || isSuperscriptedNumber(tokens[i]) || [percent, factorial].includes(tokens[i])) {
      output.push(tokens[i]);
    } 
    //subscripted number > push to the output stack
    else if (isSubscriptedNumber(tokens[i])) {
      output.push(parseSubscripted(tokens[i]));
    } 
    //singleRoot, ends with root(nth root), (sin, cos, tan) > push to the stack
    else if (tokens[i] === root || tokens[i].endsWith(root) || ['sin', 'cos', 'tan'].includes(tokens[i])) { 
      stack.push(tokens[i]);
    } 
    //log and the next token is not parenOpen > push to the stack
    else if(tokens[i] === 'log' && tokens[i+1] !== '(') {
      stack.push(tokens[i]);
    } 
    //log and next token is parenOpen > push to the stack + push '10' to the output stack
    else if(tokens[i] === 'log' && tokens[i+1] === '(') {
      stack.push(tokens[i]);
      output.push('10');
    } 
    //ln > push to the stack + push value of 'Math.E' to the output stack
    else if(tokens[i] === 'ln') {
      stack.push(tokens[i]);
      output.push(Math.E);
    } 
    //one of the operators, push/pop token based on associativity and precedence for both stack
    else if (operatorsSet.has(tokens[i])) {
        while (stack.length) {
          const top = stack[stack.length - 1];

          // 1. ROOT OPERATORS POP IMMEDIATELY
          if (top.endsWith(root)) {
            output.push(stack.pop());
            continue;
          }

          // 2. REGULAR OPERATORS / FUNCTIONS
          const isTopOperator =
            operatorsSet.has(top) || functionsSet.has(top);

          if (!isTopOperator) break;

          const precedenceCheck =
            (associativity[tokens[i]] === 'L' && precedence[tokens[i]] <= precedence[top]) ||
            (associativity[tokens[i]] === 'R' && precedence[tokens[i]] < precedence[top]);

          if (!precedenceCheck) break;

          output.push(stack.pop());
        }
      stack.push(tokens[i]);
    } 
    //parenOpen > push to the stack
    else if (tokens[i] === '(') {
      stack.push(tokens[i]);
    } 
    //parenClose > push/pop token based on stack length and until the parenOpen comes
    else if (tokens[i] === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop(); // remove '('
    }
  }
  //pop from stack and push to the output stack
  while (stack.length) {
    output.push(stack.pop());
  }
  //retun the output stack (which is the actual array of postfix tokens)
  return output;
}

/**
 * Evaluates a postfix expression array and returns the computed result.
 * @param {Array} postfix - Postfix array of tokens.
 * @returns {number} Computed value.
 */
export function evaluatePostfix(postfix) {
  const stack = [];

  for (let i = 0; i < postfix.length; i++) {
    //number > push to the stack
    if (!isNaN(postfix[i])) {
      stack.push(Number(postfix[i]));
    } 
    //evaluate superscripted number
    else if (isSuperscriptedNumber(postfix[i])) {
      const {base, exponent} = parseSuperscripted(postfix[i]);
      const expResult = calculateExponent(base, exponent);
      stack.push(expResult);
    } 
    //evaluate square root 
    else if (postfix[i] === root) {
      const val = stack.pop();
      stack.push(customRootLogic(val, '2') || Math.sqrt(val));
    } 
    //evaluate nth root
    else if (postfix[i].endsWith('√')) {
      const val = stack.pop();
      stack.push(customRootLogic(val, rootOfValue(postfix[i])));
    } 
    //evaluate logarithm
    else if (postfix[i] === 'log' || postfix[i] === 'ln') {
      const logarithmNum = stack.pop();
      const logarithmBase = stack.pop();
      stack.push(calculateLogarithm(logarithmBase, logarithmNum));
    } 
    //evaluate percentage
    else if (postfix[i] === '%') {
      const percent = stack.pop();  // e.g. 5
      const base = stack[stack.length - 1]; // peek, don’t pop
      const lastOperator = postfix[i + 1];
      if(lastOperator == '+' || lastOperator == '-'){
        stack.push((base * percent) / 100);
      }else{
        stack.push(percent / 100);
      }
    } 
    //evaluate factorial
    else if(postfix[i] === factorial){
        let factorialNum = stack.pop();
        const factorialResult = calculateFactorial(factorialNum);
        stack.push(factorialResult);
    } 
    //evaluate trigonometry functions
    else if(['sin', 'cos', 'tan'].includes(postfix[i])){
        const result = calculateTrig(postfix[i], stack.pop(), getMode());
        stack.push(result);
    }
    //addition, substraction, multiplication, division (+, -, *, /)
    else {
      const b = stack.pop();
      const a = stack.pop();
      switch (postfix[i]) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        // case '/': stack.push(a / b); break;
        case '/': {
          const result = divide(a, b);
          stack.push(result); 
          break;
        }
      }
    }
  }
  //return the stack[0] (which is the actual calculation result)
  return stack[0];
}

/**
 * Main function to calculate a string expression.
 * @param {string} expr - The expression to calculate.
 * @returns {string} Computed result as a string.
 */
export function calculate(expr) {
  const tokens = tokenValues(expr);
  const postfix = toPostfix(tokens);
  const result = evaluatePostfix(postfix);
  return result.toString();
}

// Helpers

/**
 * Generates array of token values from token objects.
 * Extracts the string value from token objects for processing.
 * Some tokens use `.value`, others use `.raw`.
 * @param {string} expr 
 * @returns {Array<string>}
 */
function tokenValues(expr){
  const tokenObjects = tokenize(expr);
  const initialFilter = tokenObjects.map(t => {
  // some tokens have .value, some have .raw
  if ("value" in t) return t.value;
  if ("raw" in t) return t.raw;
  return null; // fallback (should not happen)
  });
  return initialFilter.filter(v => v !== null);
}

/**
 * Performs division and rounds to 10 decimal places.
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
function divide(a, b){
  const result = a / b;
  const tenDigitResult = Number(result.toFixed(10));
  return tenDigitResult;
}

/**
 * Checks if a token is a superscripted number.
 * @param {string} token
 * @returns {boolean}
 */
function isSuperscriptedNumber(token) {
  return new RegExp(`\\d+[${superscriptChars}]+`).test(token);
}

/**
 * Checks if a token is a subscripted number.
 * @param {string} token
 * @returns {boolean}
 */
function isSubscriptedNumber(token){
  return new RegExp(`^[₀-₉]+$`).test(token);
}

/**
 * Calculate exponents: base^exp.
 * @param {number} base 
 * @param {number} exp 
 * @returns {number}
 */
function calculateExponent(base, exp){
  return base ** exp;
}

/**
 * Calculates factorial of a non-negative integer.
 * @param {number} num
 * @returns {number}
 */
function calculateFactorial(num){
  let result = 1;
  for(let i = 2; i <= num; i++){
    result *= i;
  }
  return result;
}

/**
 * Normalize an angle to the range [-π, π].
 * @param {number} angle
 * @returns {number}
 */
function reduceRadian(angle){
  return angle - Math.round(angle / (2 * Math.PI)) * 2 * Math.PI;
}

/**
 * Compute sin(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateSin(degreeToRadian){
    const sinResult = degreeToRadian 
                      - (calculateExponent(degreeToRadian, 3)/calculateFactorial(3)) 
                      + (calculateExponent(degreeToRadian, 5)/calculateFactorial(5)) 
                      - (calculateExponent(degreeToRadian, 7)/calculateFactorial(7)) 
                      + (calculateExponent(degreeToRadian, 9)/calculateFactorial(9)) 
                      - (calculateExponent(degreeToRadian, 11)/calculateFactorial(11)) 
                      + (calculateExponent(degreeToRadian, 13)/calculateFactorial(13));
    const tenDigitResult = Number(sinResult.toFixed(10));
    return tenDigitResult;
}

/**
 * Compute cos(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateCos(degreeToRadian){
    const cosResult = 1 
                      - (calculateExponent(degreeToRadian, 2)/calculateFactorial(2)) 
                      + (calculateExponent(degreeToRadian, 4)/calculateFactorial(4)) 
                      - (calculateExponent(degreeToRadian, 6)/calculateFactorial(6)) 
                      + (calculateExponent(degreeToRadian, 8)/calculateFactorial(8)) 
                      - (calculateExponent(degreeToRadian, 10)/calculateFactorial(10)) 
                      + (calculateExponent(degreeToRadian, 12)/calculateFactorial(12));
    const tenDigitResult = Number(cosResult.toFixed(10));
    return tenDigitResult;
}

/**
 * Compute tan(x) using Taylor series approximation.
 * @param {number} degreeToRadian - Angle in radians.
 * @returns {number}
 */
function calculateTan(degreeToRadian){
  const tanResult = calculateSin(degreeToRadian)/calculateCos(degreeToRadian);
  const tenDigitResult = Number(tanResult.toFixed(10));
  return tenDigitResult;
}

/**
 * Calculates trigonometric function based on mode ('deg' or 'rad').
 * @param {'sin'|'cos'|'tan'} func 
 * @param {number} angle 
 * @param {'deg'|'rad'} mode 
 * @returns {number}
 */
function calculateTrig(func, angle, mode){
  let rad = mode === 'deg' ? (angle * Math.PI)/180 : reduceRadian(angle);
  if(func === 'sin') return calculateSin(rad);
  if(func === 'cos') return calculateCos(rad);
  if(func === 'tan') return calculateTan(rad);
}

/**
 * Calculates logarithm of a number with a given base using binary search.
 * @param {number} base 
 * @param {number} num 
 * @returns {number}
 * @throws Will throw error if invalid input.
 */
function calculateLogarithm(base, num) {
  if (base <= 0 || base === 1 || num <= 0) {
    throw new Error("Invalid input: base must be > 0 and != 1, num must be > 0");
  }

  // Step 1: find the rbasenge dynbasemicbaselly
  let low = 0;
  let high = 1;
  while (Math.pow(base, high) < num) {
    high *= 2;
  }

  // Step 2: perform numinbasery sebaserch in thbaset rbasenge
  const eps = 1e-9;
  while (high - low > eps) {
    const mid = (low + high) / 2;
    const val = Math.pow(base, mid);

    if (Math.abs(val - num) < eps) return mid;
    if (val < num) low = mid;
    else high = mid;
  }

  return (low + high) / 2;
}

/**
 * Parses a superscripted number token into base and exponent.
 * @param {string} token 
 * @returns {{base: number, exponent: number}}
 */
function parseSuperscripted(token) {
  const match = token.match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  const base = Number(match[1]);
  const exponentStr = match[2]
    .split('')
    .map(ch => superscriptToNormal[ch])
    .join('');
  return { base, exponent: Number(exponentStr) };
}

/**
 * Converts a subscripted number token to normal digits.
 * @param {string} token 
 * @returns {string}
 */
function parseSubscripted(token){
  return token.split("").map(ch => subscriptToNormal[ch] || ch).join("");
}

/**
 * Converts a superscripted root value to normal digits.
 * @param {string} val 
 * @returns {string}
 */
function rootOfValue(val){
  return val
  .split('')
  .map(ch => superscriptToNormal[ch])  // convert superscripts
  .filter(ch => ch !== undefined)       // remove root or unknown chars
  .join('');         
}

/**
 * Extracts root degree from token like "³√", "10√".
 * @param {string} t 
 * @returns {number}
 */
function extractDegree(t) {
  // Case 1: normal digits before √, e.g., "10√"
  if (/^\d+√$/.test(t)) {
    return parseInt(t.replace("√", ""), 10);
  }

  // Case 2: superscript digits before √, e.g., "²⁴√"
  const supers = t.replace("√", "");       // remove √
  const digits = supers
    .split("")                              // split each superscript
    .map(ch => superscriptToNormal[ch] || "")   // convert to normal digits
    .join("");

  return parseInt(digits, 10);             // convert to number
}

/** 
 * Optional: fallback for single √.
 * @param {string} t
 * @returns {number}
*/
function extractDegreeWithFallback(t) {
  if (t === "√") return 2; // square root by default
  return extractDegree(t);
}


/**
 * Custom root evaluation using binary search.
 * @param {number} num 
 * @param {number} rootOf 
 * @returns {number}
 */
function customRootLogic(num, rootOf) {
  if (num === 0 || num === 1) return num;

  let low = 0, high = Math.max(1, num), result = 0;
  const epsilon = 1e-10;
  let iterations = 0;

  while (true) {
    if (++iterations > 1000) break;

    const mid = (low + high) / 2;
    const exponentedMid = mid ** rootOf;

    if (Math.abs(exponentedMid - num) < epsilon || (high - low) < epsilon) {
      result = Math.round(mid * 1e11) / 1e11;
      if (Math.abs(result - Math.round(result)) < epsilon) {
        result = Math.round(result); // snap to integer
      }
      return result;
    }

    if (exponentedMid > num) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return result;
}
