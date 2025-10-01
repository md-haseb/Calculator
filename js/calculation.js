// import {isOperator} from './validation.js';
import {operatorsSet, precedence, associativity, superscripts, superscriptToNormal, root, percent, factorial} from './constants.js';

// const operators = '+*/-';

const superscriptChars = Array.from(superscripts).join('');

// for tokenize/making array of numbers and operators
export function tokenize(expr){
  const tokenRegEx = new RegExp(`\\d+(?:\\.\\d+)?[${superscriptChars}]*|[+\\-*/√%!()]`, 'g');
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
    } else if (token === root) {
      stack.push(token);
    } else if (operatorsSet.has(token)) {
      while (
        stack.length &&
        operatorsSet.has(stack[stack.length - 1]) &&
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
      stack.push(base ** exponent);
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
      let factorialResult = 1;
      for(let i = 2; i <= factorialNum; i++){
        factorialResult *= i;
      }
      stack.push(factorialResult);
    } else {
      const b = stack.pop();
      const a = stack.pop();
      switch (postfix[i]) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(a / b); break;
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
function isSuperscriptedNumber(token) {
  return new RegExp(`\\d+[${superscriptChars}]+`).test(token);
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