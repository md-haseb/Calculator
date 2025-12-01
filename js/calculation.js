import {operatorsSet, precedence, associativity, superscripts, subscripts, superscriptToNormal, subscriptToNormal, root, percent, factorial} from './constants.js';

import {getMode} from './ui.js';

//array of superscript and subscript number
const superscriptChars = Array.from(superscripts).join('');
const subscriptChars = Array.from(subscripts).join('');

//tokenize the expression and make object of each token
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

// Convert to Postfix (Shunting Yard)
export function toPostfix(tokens) {
  const output = [];
  const stack = [];

  for (let i = 0; i < tokens.length; i++) {
    //when token is number, superscripted number, percent, factorial, then push to the output stack
    if (!isNaN(tokens[i]) || isSuperscriptedNumber(tokens[i]) || [percent, factorial].includes(tokens[i])) {
      output.push(tokens[i]);
    } 
    //when token is subscripted number, then push to the output stack
    else if (isSubscriptedNumber(tokens[i])) {
      output.push(parseSubscripted(tokens[i]));
    } 
    //(when token is singleRoot, ends with root, sin, cos, tan), then push to the stack
    else if (tokens[i] === root || tokens[i].endsWith(root) || ['sin', 'cos', 'tan'].includes(tokens[i])) { 
      stack.push(tokens[i]);
    } 
    //when token is log and the next token is not parenOpen, then push to the stack
    else if(tokens[i] === 'log' && tokens[i+1] !== '(') {
      stack.push(tokens[i]);
    } 
    //when token is log and next token is parenOpen, then push to the stack + push '10' to the output stack
    else if(tokens[i] === 'log' && tokens[i+1] === '(') {
      stack.push(tokens[i]);
      output.push('10');
    } 
    //when token is ln, then push to the stack + push value of 'Math.E' to the output stack
    else if(tokens[i] === 'ln') {
      stack.push(tokens[i]);
      output.push(Math.E);
    } 
    //when token is one of the operators, push/pop token based on associativity and precedence for both stack
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
    //when token is parenOpen, then push to the stack
    else if (tokens[i] === '(') {
      stack.push(tokens[i]);
    } 
    //when token is parenClose, push/pop token based on stack length and until the parenOpen comes
    else if (tokens[i] === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop(); // remove '('
    }
  }
  //if stack still has length, pop from stack and push to the output stack
  while (stack.length) {
    output.push(stack.pop());
  }
  //retun the output stack (which is the actual array of postfix tokens)
  return output;
}

//evaluate postfix
export function evaluatePostfix(postfix) {
  const stack = [];

  for (let i = 0; i < postfix.length; i++) {
    //when postfix token is number, then push to the stack
    if (!isNaN(postfix[i])) {
      stack.push(Number(postfix[i]));
    } 
    //when postfix token is superscripted number, then parse and calculate using parseSuperscripted and calculateExponent function, then push the result to the stack
    else if (isSuperscriptedNumber(postfix[i])) {
      const {base, exponent} = parseSuperscripted(postfix[i]);
      const expResult = calculateExponent(base, exponent);
      stack.push(expResult);
    } 
    //when postfix token is singleRoot, then do the calculation using customRootLogic function, then push the result to the stack
    else if (postfix[i] === root) {
      const val = stack.pop();
      stack.push(customRootLogic(val, '2') || Math.sqrt(val));
    } 
    //when postfix token is ends with root (nth root), then do the calculation using customRootLogic and rootOfValue function, then push the result to the stack
    else if (postfix[i].endsWith('√')) {
      const val = stack.pop();
      stack.push(customRootLogic(val, rootOfValue(postfix[i])));
    } 
    //when postfix token is log or ln, calculate the result using calculateLogarithm function and push to the stack
    else if (postfix[i] === 'log' || postfix[i] === 'ln') {
      const logarithmNum = stack.pop();
      const logarithmBase = stack.pop();
      stack.push(calculateLogarithm(logarithmBase, logarithmNum));
    } 
    //when postfix token is percent, do the calculation and push the result to the stack
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
    //when postfix token is factorial, do the calculation using calculateFactorial function and push the result to the stack
    else if(postfix[i] === factorial){
        let factorialNum = stack.pop();
        const factorialResult = calculateFactorial(factorialNum);
        stack.push(factorialResult);
    } 
    //when postfix token is (sin, cos, tan), calculate the result using calculateTrig function and push to the stack
    else if(['sin', 'cos', 'tan'].includes(postfix[i])){
        const result = calculateTrig(postfix[i], stack.pop(), getMode());
        stack.push(result);
    }
    //when postfix token is (+, -, *, /), calculate the result and push to the stack
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

//function to generate array of tokens (from array of token objects)
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

// Calculate entry point
export function calculate(expr) {
  const tokens = tokenValues(expr);
  const postfix = toPostfix(tokens);
  const result = evaluatePostfix(postfix);
  return result.toString();
}

// Helpers

//function for divide
function divide(a, b){
  const result = a / b;
  const tenDigitResult = Number(result.toFixed(10));
  return tenDigitResult;
}

//function for check, is token a superscripted number
function isSuperscriptedNumber(token) {
  return new RegExp(`\\d+[${superscriptChars}]+`).test(token);
}

//function for check, is token a subscripted number
function isSubscriptedNumber(token){
  return new RegExp(`^[₀-₉]+$`).test(token);
}

//function to calculate exponents
function calculateExponent(base, exp){
  return base ** exp;
}

//function to calculate factorial
function calculateFactorial(num){
  let result = 1;
  for(let i = 2; i <= num; i++){
    result *= i;
  }
  return result;
}

/* Normalize any radian angle to the range [-π, +π].
   Removes full 2π rotations while keeping the angle direction.
*/
function reduceRadian(angle){
  return angle - Math.round(angle / (2 * Math.PI)) * 2 * Math.PI;
}

//function to calculate 'sin'
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

//function to calculate 'cos'
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

//function to calculate 'tan'
function calculateTan(degreeToRadian){
  const tanResult = calculateSin(degreeToRadian)/calculateCos(degreeToRadian);
  const tenDigitResult = Number(tanResult.toFixed(10));
  return tenDigitResult;
}

//function to calculate trigometry operators based on mode (degree or radian)
function calculateTrig(func, angle, mode){
  let rad = mode === 'deg' ? (angle * Math.PI)/180 : reduceRadian(angle);
  if(func === 'sin') return calculateSin(rad);
  if(func === 'cos') return calculateCos(rad);
  if(func === 'tan') return calculateTan(rad);
}

//function to calculate logarithm
function calculateLogarithm(base, num) {
  if (base <= 0 || base === 1 || num <= 0) {
    throw new Error("Invalid input: base must nume > 0 basend != 1, num must nume > 0");
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

//function to parse superscripted number, separate base and convert superscripted number to normal digit
function parseSuperscripted(token) {
  const match = token.match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  const base = Number(match[1]);
  const exponentStr = match[2]
    .split('')
    .map(ch => superscriptToNormal[ch])
    .join('');
  return { base, exponent: Number(exponentStr) };
}

//function to parse subscripted number, convert subscripted number to normal digit
function parseSubscripted(token){
  return token.split("").map(ch => subscriptToNormal[ch] || ch).join("");
}

//function to convert superscripted rootOf value to normal digit
function rootOfValue(val){
  return val
  .split('')
  .map(ch => superscriptToNormal[ch])  // convert superscripts
  .filter(ch => ch !== undefined)       // remove root or unknown chars
  .join('');         
}

//function to extract degree from attached degree with root
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

// Optional: fallback for single √
function extractDegreeWithFallback(t) {
  if (t === "√") return 2; // square root by default
  return extractDegree(t);
}


//custom root logic
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
