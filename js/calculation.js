// import {isOperator} from './validation.js';
import {operatorsSet, precedence, associativity, superscripts, subscripts, superscriptToNormal, subscriptToNormal, root, percent, factorial} from './constants.js';

import {getMode} from './ui.js';

// const operators = '+*/-';

const superscriptChars = Array.from(superscripts).join('');
const subscriptChars = Array.from(subscripts).join('');

// for tokens[i]ize/making array of numbers and operators
// export function tokenize(expr){
//   console.log(expr);
//   const tokenRegEx = new RegExp(`(?:sin|cos|tan|log|ln|C|P|□|π|e)` +                  // functions
//   `|[${superscriptChars}]+√` +  // nth-root operator like 3√, 7√
//   `|(?:\\d+\\.\\d+|\\d+|\\.\\d+)[${superscriptChars}${subscriptChars}]*` + // numbers with optional super/subscripts
//   `|[${superscriptChars}${subscriptChars}]+` + // consecutive standalone super/subscripts
//   `|[+\\-*/√%!()]`,                           // operators
//   'g');
//   console.log(expr.match(tokenRegEx));
//   // return expr.match(tokenRegEx);
//   const rawTokens = expr.match(tokenRegEx) || [];
//   const tokens = [];
  
//   for (const t of rawTokens) {
//     if (["sin", "cos", "tan", "log", "ln"].includes(t)) {
//       tokens.push({ type: "function", value: t });
//     }
//     else if (t === "C" || t === "P") {
//       tokens.push({ type: "combAndPerm", value: t });
//     }
//     else if (t === 'π' || t === 'e'){
//       tokens.push({ type: "constant", value: t });
//     }
//     else if (new RegExp(`\\d+(?:\\.\\d+)?[${superscriptChars}${subscriptChars}]+`).test(t)){
//       tokens.push({ type: "supAndSub", value: t });
//     }
//     else if (new RegExp(`^[${subscriptChars}]+$`).test(t)){
//       tokens.push({type: "subscriptValue", value: t });
//     }
//     else if (/^\d*\.\d+$/.test(t)){
//       tokens.push({ type: "numberWithDecimal", value: parseFloat(t) });
//     }
//     else if (/^\d+$/.test(t)) {
//       tokens.push({ type: "number", value: parseFloat(t) });
//     }
//     else if (/\(/.test(t)) {
//       tokens.push({type: "parenOpen", value: t});
//     }
//     else if (/\)/.test(t)) {
//       tokens.push({type: "parenClose", value: t});
//     }
//     else if (t === "□") {
//       tokens.push({ type: "box", value: "□" });
//     }
//     else if (/[+*/%!-]/.test(t)) {
//       tokens.push({ type: "operator", value: t });
//     }
//     else if (t === "√") {
//       tokens.push({ type: "singleRoot", degree: 2, raw: t }); // single √
//     }
//     else if (/^\d+√$/.test(t) || new RegExp(`[${superscriptChars}]+√`).test(t)) { //^[²³⁴⁵⁶⁷⁸⁹]+√$/ (older)
//       tokens.push({ type: "nthRoot", degree: extractDegree(t), raw: t }); // multi-digit root
//     }
//     else {
//       tokens.push({ type: "unknown", value: t });
//     }
//   }

//   console.log(tokens);
//   return tokens;
// }





export function tokenize(expr){
  console.log(expr);

  const tokens = [];

  // ---- Precompile regexes (for performance & clarity) ----
  const tokenRegEx = new RegExp(`(?:sin|cos|tan|log|ln|C|P|□|π|e)` +                  // functions
  `|[${superscriptChars}]+√` +  // nth-root operator like 3√, 7√
  `|(?:\\d+\\.\\d+|\\d+|\\.\\d*)[${superscriptChars}${subscriptChars}]*` + // numbers with optional super/subscripts
  `|[${superscriptChars}${subscriptChars}]+` + // consecutive standalone super/subscripts
  `|[+\\-*/√%!()]`,                           // operators
  'g');
  console.log(expr.match(tokenRegEx));
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
    if (reNthRoot.test(t)) { //^[²³⁴⁵⁶⁷⁸⁹]+√$/ (older), /^\d+√$/.test(t) || (for like 3√5, 5√9)
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
  // console.log(tokens);
  const output = [];
  const stack = [];

  for (let i = 0; i < tokens.length; i++) {
    if (!isNaN(tokens[i]) || isSuperscriptedNumber(tokens[i]) || [percent, factorial].includes(tokens[i])) {
      output.push(tokens[i]);
    } else if (isSubscriptedNumber(tokens[i])) {
      output.push(parseSubscripted(tokens[i]));
    } else if (tokens[i] === root || tokens[i].endsWith(root) || ['sin', 'cos', 'tan'].includes(tokens[i])) { 
      stack.push(tokens[i]);
    } else if(tokens[i] === 'log' && tokens[i+1] !== '(') {
      stack.push(tokens[i]);
    } else if(tokens[i] === 'log' && tokens[i+1] === '(') {
      stack.push(tokens[i]);
      output.push('10');
    } else if(tokens[i] === 'ln') {
      stack.push(tokens[i]);
      output.push(Math.E);
    } else if (operatorsSet.has(tokens[i])) {
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
    } else if (tokens[i] === '(') {
      stack.push(tokens[i]);
    } else if (tokens[i] === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop(); // remove '('
    }
  }

  while (stack.length) {
    output.push(stack.pop());
  }
  console.log(stack);
  console.log(output);
  return output;
}

//evaluate postfix
export function evaluatePostfix(postfix) {
  const stack = [];
  console.log(postfix);

  for (let i = 0; i < postfix.length; i++) {
    if (!isNaN(postfix[i])) {
      stack.push(Number(postfix[i]));
    } else if (isSuperscriptedNumber(postfix[i])) {
      const {base, exponent} = parseSuperscripted(postfix[i]);
      const expResult = calculateExponent(base, exponent);
      stack.push(expResult);
    } else if (postfix[i] === root) {
      const val = stack.pop();
      stack.push(customRootLogic(val, '2') || Math.sqrt(val));
    } else if (postfix[i].endsWith('√')) {
      const val = stack.pop();
      stack.push(customRootLogic(val, rootOfValue(postfix[i])));
    } else if (postfix[i] === 'log' || postfix[i] === 'ln') {
      const logarithmNum = stack.pop();
      const logarithmBase = stack.pop();
      stack.push(calculateLogarithm(logarithmBase, logarithmNum));
    } else if (postfix[i] === '%') {
      const percent = stack.pop();  // e.g. 5
      const base = stack[stack.length - 1]; // peek, don’t pop
      const lastOperator = postfix[i + 1];
      if(lastOperator == '+' || lastOperator == '-'){
        stack.push((base * percent) / 100);
      }else{
        stack.push(percent / 100);
      }
    } else if(postfix[i] === factorial){
        let factorialNum = stack.pop();
        const factorialResult = calculateFactorial(factorialNum);
        stack.push(factorialResult);
    } else if(['sin', 'cos', 'tan'].includes(postfix[i])){
        console.log(stack);
        console.log(postfix[i]);
        const result = calculateTrig(postfix[i], stack.pop(), getMode());
        stack.push(result);

        // const degree = stack.pop();
        // let degreeToRadian = null;
        // let mode = getMode();
        // if(mode === 'deg'){
        //   degreeToRadian = (degree * Math.PI) / 180;
        // }else{
        //   degreeToRadian = reduceRadian(degree);
        // }
        // if(postfix[i] === 'sin'){
        //   const result = calculateSin(degreeToRadian);
        //   stack.push(result);
        // }
        // if(postfix[i] === 'cos'){
        //   const result = calculateCos(degreeToRadian);
        //   stack.push(result);
        // }
        // if(postfix[i] === 'tan'){
        //   const result = calculateTan(degreeToRadian);
        //   stack.push(result);
        // }
    }
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
  return stack[0];
}

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
function divide(a, b){
  const result = a / b;
  const tenDigitResult = Number(result.toFixed(10));
  return tenDigitResult;
}

function isSuperscriptedNumber(token) {
  return new RegExp(`\\d+[${superscriptChars}]+`).test(token);
}

function isSubscriptedNumber(token){
  return new RegExp(`^[₀-₉]+$`).test(token);
}

function calculateExponent(base, exp){
  return base ** exp;
}

function calculateFactorial(num){
  let result = 1;
  for(let i = 2; i <= num; i++){
    result *= i;
  }
  return result;
}

function reduceRadian(angle){
  return angle - Math.round(angle / (2 * Math.PI)) * 2 * Math.PI;
}

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

function calculateTan(degreeToRadian){
  const tanResult = calculateSin(degreeToRadian)/calculateCos(degreeToRadian);
  const tenDigitResult = Number(tanResult.toFixed(10));
  return tenDigitResult;
}

function calculateTrig(func, angle, mode){
  let rad = mode === 'deg' ? (angle * Math.PI)/180 : reduceRadian(angle);
  if(func === 'sin') return calculateSin(rad);
  if(func === 'cos') return calculateCos(rad);
  if(func === 'tan') return calculateTan(rad);
}

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

function parseSuperscripted(token) {
  const match = token.match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  const base = Number(match[1]);
  const exponentStr = match[2]
    .split('')
    .map(ch => superscriptToNormal[ch])
    .join('');
  return { base, exponent: Number(exponentStr) };
}

function parseSubscripted(token){
  return token.split("").map(ch => subscriptToNormal[ch] || ch).join("");
}

function rootOfValue(val){
  return val
  .split('')
  .map(ch => superscriptToNormal[ch])  // convert superscripts
  .filter(ch => ch !== undefined)       // remove root or unknown chars
  .join('');         
}

function extractDegree(t) {
  // Case 1: normal digits before √, e.g., "10√"
  if (/^\d+√$/.test(t)) {
    return parseInt(t.replace("√", ""), 10);
  }

  // Case 2: superscript digits before √, e.g., "²⁴√"
  // const superscriptMap = {
  //   "²": "2", "³": "3", "⁴": "4", "⁵": "5",
  //   "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9"
  // };

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

//this function is for calculation
// export function calculate(expression){
//   const tokens[i]s = tokens[i]ize(expression);

//   //this loop evaluates brackets in the expression
//   const stack = [];
//   for(let i = 0; i < tokens[i]s.length; i++){
//     let start = 0;
//     let end = 0;
//     if(tokens[i]s[i] === '('){
//       stack.push(i);
//     }
//     if(tokens[i]s[i] === ')'){
//       start = stack.pop();
//       end = i;
//       let insideElement = tokens[i]s.slice(start + 1, end);
//       let result = calculate(insideElement);
//       tokens[i]s.splice(start, insideElement.length + 2, result);
//       i = start;
//     }
//   }

//   //this loop evaluates square root and exponent in the expression
//   for(let i = 0; i < tokens[i]s.length; i++){
//     //to calculate square root
//     if(tokens[i]s[i] === '√'){
//       const rootNumber = Number(tokens[i]s[i + 1]);

//       if(rootNumber === 0 || rootNumber === 1){  //if user type 0 and 1 after root
//         tokens[i]s.splice(i, 2, rootNumber);
//         continue;
//       }

//       let high = Math.max(1, rootNumber);  //finding the square root using binary search algorithm
//       let low = 0;
//       let result = 0;
//       let iterations = 0;

//       while(true){
//         if(++iterations > 1000) break;

//         const average = (high + low) / 2;
//         const square = average * average;
//         const epsilon = 1e-10;

//         if(Math.abs(square - rootNumber) < epsilon || (high - low) < epsilon){
//           result = Math.round(average * 1e11) / 1e11; 
//           if(Math.abs(result - Math.round(result)) < epsilon){  // for integer result (Line 56 - 58)
//             result = Math.round(result);
//           }
//           tokens[i]s.splice(i, 2, result);
//           break;
//         }
//         if(square > rootNumber){
//           high = average;
//         }else{
//           low = average;
//         }
//       }
//     }
  //   //to calculate exponent
  //   if(String(tokens[i]s[i]).match(new RegExp(`\\d+[${superscriptChars}]+`))){ 
  //     // const superscriptToNormal = {
  //     //   "\u2070": "0",
  //     //   "\u00B9": "1",
  //     //   "\u00B2": "2",
  //     //   "\u00B3": "3",
  //     //   "\u2074": "4",
  //     //   "\u2075": "5",
  //     //   "\u2076": "6",
  //     //   "\u2077": "7",
  //     //   "\u2078": "8",
  //     //   "\u2079": "9"
  //     // };
      
  //     const match = tokens[i]s[i].match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  //     console.log(match);
  //     const base = Number(match[1]);
  //     const exponentStr = match[2].split('').map(ch => superscriptToNormal[ch]).join('');
  //     const exponent = Number(exponentStr);
  //     let result = base ** exponent;
  //     tokens[i]s.splice(i, 1, result);
  //   }
  // }

//   //this loop evaluates 'multiplication and division' first in the expression
//   for(let i = 0; i < tokens[i]s.length; i++){
//     let result = '';
//     if(tokens[i]s[i] === '*'){
//       result = Number(tokens[i]s[i - 1]) * Number(tokens[i]s[i + 1]);
//       tokens[i]s.splice(i - 1, 3, result);
//       i--;
//     }
//     if(tokens[i]s[i] === '/'){
//       result = Number(tokens[i]s[i - 1]) / Number(tokens[i]s[i + 1]);
//       tokens[i]s.splice(i - 1, 3, result);
//       i--;
//     }
//   }

//   //this loop evaluates 'addition and substraction' in the expression
//   for(let i = 0; i < tokens[i]s.length; i++){
//     let result = '';
//     if(tokens[i]s[i] === '+'){
//       result = Number(tokens[i]s[i - 1]) + Number(tokens[i]s[i + 1]);
//       tokens[i]s.splice(i - 1, 3, result);
//       i--;
//     }
//     if(tokens[i]s[i] === '-'){
//       result = Number(tokens[i]s[i - 1]) - Number(tokens[i]s[i + 1]);
//       tokens[i]s.splice(i - 1, 3, result);
//       i--;
//     }
//   }   
//   //this will return the final result of the expression
//   return tokens[i]s[0].toString();
// }