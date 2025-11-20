// import {isOperator} from './validation.js';
import {operatorsSet, precedence, associativity, superscripts, subscripts, superscriptToNormal, root, percent, factorial} from './constants.js';

import {getMode} from './ui.js';

// const operators = '+*/-';

const superscriptChars = Array.from(superscripts).join('');
const subscriptChars = Array.from(subscripts).join('');

// for tokenize/making array of numbers and operators
export function tokenize(expr){
  console.log(expr);
  const tokenRegEx = new RegExp(`(?:sin|cos|tan|log|ln)` +                  // functions
  `|\\d+(?:\\.\\d+)?[${superscriptChars}${subscriptChars}]*` + // numbers with optional super/subscripts
  `|[${superscriptChars}${subscriptChars}]+` + // consecutive standalone super/subscripts
  `|[+\\-*/√%!()]`,                           // operators
  'g');
  console.log(expr.match(tokenRegEx));
  return expr.match(tokenRegEx);
}

// Convert to Postfix (Shunting Yard)
export function toPostfix(tokens) {
  console.log(tokens);
  const output = [];
  const stack = [];

  for (let token of tokens) {
    if (!isNaN(token) || isSuperscriptedNumber(token) || [percent, factorial].includes(token)) {
      output.push(token);
    } else if (token === root || ['sin', 'cos', 'tan'].includes(token)) {
      stack.push(token);
    } else if (operatorsSet.has(token)) {
      while (
        stack.length &&
        (operatorsSet.has(stack[stack.length - 1]) || ['sin', 'cos', 'tan'].includes(stack[stack.length - 1])) &&
        (
          (associativity[token] === 'L' &&
           precedence[token] <= precedence[stack[stack.length - 1]]) ||
          (associativity[token] === 'R' &&
           precedence[token] < precedence[stack[stack.length - 1]])
        )
      ) {
        output.push(stack.pop());
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
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
  return output;
}

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
      stack.push(customSquareRootLogic(val) || Math.sqrt(val));
    }else if (postfix[i] === '%') {
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

// Calculate entry point
export function calculate(expr) {
  const tokens = tokenize(expr);
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

function parseSuperscripted(token) {
  const match = token.match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  const base = Number(match[1]);
  const exponentStr = match[2]
    .split('')
    .map(ch => superscriptToNormal[ch])
    .join('');
  return { base, exponent: Number(exponentStr) };
}

//custom square root logic
function customSquareRootLogic(num) {
  if (num === 0 || num === 1) return num;

  let low = 0, high = Math.max(1, num), result = 0;
  const epsilon = 1e-10;
  let iterations = 0;

  while (true) {
    if (++iterations > 1000) break;

    const mid = (low + high) / 2;
    const square = mid * mid;

    if (Math.abs(square - num) < epsilon || (high - low) < epsilon) {
      result = Math.round(mid * 1e11) / 1e11;
      if (Math.abs(result - Math.round(result)) < epsilon) {
        result = Math.round(result); // snap to integer
      }
      return result;
    }

    if (square > num) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return result;
}

//this function is for calculation
// export function calculate(expression){
//   const tokens = tokenize(expression);

//   //this loop evaluates brackets in the expression
//   const stack = [];
//   for(let i = 0; i < tokens.length; i++){
//     let start = 0;
//     let end = 0;
//     if(tokens[i] === '('){
//       stack.push(i);
//     }
//     if(tokens[i] === ')'){
//       start = stack.pop();
//       end = i;
//       let insideElement = tokens.slice(start + 1, end);
//       let result = calculate(insideElement);
//       tokens.splice(start, insideElement.length + 2, result);
//       i = start;
//     }
//   }

//   //this loop evaluates square root and exponent in the expression
//   for(let i = 0; i < tokens.length; i++){
//     //to calculate square root
//     if(tokens[i] === '√'){
//       const rootNumber = Number(tokens[i + 1]);

//       if(rootNumber === 0 || rootNumber === 1){  //if user type 0 and 1 after root
//         tokens.splice(i, 2, rootNumber);
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
//           tokens.splice(i, 2, result);
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
  //   if(String(tokens[i]).match(new RegExp(`\\d+[${superscriptChars}]+`))){ 
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
      
  //     const match = tokens[i].match(new RegExp(`(\\d+)([${superscriptChars}]+)`));
  //     console.log(match);
  //     const base = Number(match[1]);
  //     const exponentStr = match[2].split('').map(ch => superscriptToNormal[ch]).join('');
  //     const exponent = Number(exponentStr);
  //     let result = base ** exponent;
  //     tokens.splice(i, 1, result);
  //   }
  // }

//   //this loop evaluates 'multiplication and division' first in the expression
//   for(let i = 0; i < tokens.length; i++){
//     let result = '';
//     if(tokens[i] === '*'){
//       result = Number(tokens[i - 1]) * Number(tokens[i + 1]);
//       tokens.splice(i - 1, 3, result);
//       i--;
//     }
//     if(tokens[i] === '/'){
//       result = Number(tokens[i - 1]) / Number(tokens[i + 1]);
//       tokens.splice(i - 1, 3, result);
//       i--;
//     }
//   }

//   //this loop evaluates 'addition and substraction' in the expression
//   for(let i = 0; i < tokens.length; i++){
//     let result = '';
//     if(tokens[i] === '+'){
//       result = Number(tokens[i - 1]) + Number(tokens[i + 1]);
//       tokens.splice(i - 1, 3, result);
//       i--;
//     }
//     if(tokens[i] === '-'){
//       result = Number(tokens[i - 1]) - Number(tokens[i + 1]);
//       tokens.splice(i - 1, 3, result);
//       i--;
//     }
//   }   
//   //this will return the final result of the expression
//   return tokens[0].toString();
// }