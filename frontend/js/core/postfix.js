import {operatorsSet, precedence, associativity, root, percent, factorial} from './constants.js';

import {getMode} from '../ui/ui.js';

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