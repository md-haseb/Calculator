import {plus, minus, unaryMinus, multiplyBy, divideBy, operatorsSet, precedence, associativity, root, percent, factorial, pi, E, trigFunctions, logFunctions, paren, constantsValue, combinatorics} from './constants.js';

import { divide, isNumWithSuperscript, isSuperscriptedNumber, isSubscriptedNumber, calculateExponent, calculateFactorial, calculateTrig, calculateLogarithm, parseNumWithSuperscript, parseSuperscripted, parseSubscripted, rootOfValue, customRootLogic, evaluateComb, evaluatePerm, calculateNumWithPi, calculateNumWithE } from './mathHelpers.js';

import {getMode} from '../ui/uiState.js';

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
    if (!isNaN(tokens[i]) || isNumWithSuperscript(tokens[i]) || [percent, factorial].includes(tokens[i])) {
      output.push(tokens[i]);
    } 
    //superscripted number > push to the output stack
    else if (isSuperscriptedNumber(tokens[i])) {
      output.push(parseSuperscripted(tokens[i]));
    } 
    //constant (π, e) and numberWithPi > push to the output stack
    else if (tokens[i] === pi || tokens[i].endsWith(pi) || tokens[i] === E || tokens[i].endsWith(E)) {
      output.push(tokens[i]);
    }
    //subscripted number > push to the output stack
    else if (isSubscriptedNumber(tokens[i])) {
      output.push(parseSubscripted(tokens[i]));
    } 
    //singleRoot, ends with root(nth root), (sin, cos, tan) > push to the stack
    else if (tokens[i] === root || tokens[i].endsWith(root) || trigFunctions.includes(tokens[i]) || tokens[i] === combinatorics.combination || tokens[i] === combinatorics.permutation || tokens[i] === unaryMinus) { 
      stack.push(tokens[i]);
    } 
    //log and the next token is not parenOpen > push to the stack
    else if(tokens[i] === logFunctions.log && tokens[i+1] !== paren.open) {
      stack.push(tokens[i]);
    } 
    //log and next token is parenOpen > push to the stack + push '10' to the output stack
    else if(tokens[i] === logFunctions.log && tokens[i+1] === paren.open) {
      stack.push(tokens[i]);
      output.push(constantsValue.ten);
    } 
    //ln > push to the stack + push value of 'Math.E' to the output stack
    else if(tokens[i] === logFunctions.ln) {
      stack.push(tokens[i]);
      output.push(constantsValue.E);
    } 
    //one of the operators, push/pop token based on associativity and precedence for both stack
    else if (operatorsSet.has(tokens[i])) {
        while (stack.length) {
          const top = stack[stack.length - 1];

          // 1. ROOT OPERATORS POP IMMEDIATELY
          if (top.endsWith(root) || top === combinatorics.combination || top === combinatorics.permutation || top === unaryMinus) {
            output.push(stack.pop());
            continue;
          }

          // 2. REGULAR OPERATORS / FUNCTIONS
          const isTopOperator =
          operatorsSet.has(top);
            // operatorsSet.has(top) || functionsSet.has(top);

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
    else if (tokens[i] === paren.open) {
      stack.push(tokens[i]);
    } 
    //parenClose > push/pop token based on stack length and until the parenOpen comes
    else if (tokens[i] === paren.close) {
      while (stack.length && stack[stack.length - 1] !== paren.open) {
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
  console.log(output);
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
    else if (postfix[i] === 'NEG') {
      const value = stack.pop();
      stack.push(-value);
      console.log(stack);
    }
    // PI > push to the stack
    else if (postfix[i] === pi) {
      stack.push(constantsValue.pi);
    }
    // evaluate num With PI
    else if (postfix[i].endsWith(pi)) {
      const result = calculateNumWithPi(postfix[i]);
      stack.push(result);
    }
    // e > push to the stack
    else if (postfix[i] === E) {
      stack.push(constantsValue.E);
    }
    // evaluate num with e
    else if (postfix[i].endsWith(E)) {
      const result = calculateNumWithE(postfix[i]);
      stack.push(result);
    }
    //evaluate superscripted number
    else if (isNumWithSuperscript(postfix[i])) {
      const {base, exponent} = parseNumWithSuperscript(postfix[i]);
      const expResult = calculateExponent(base, exponent);
      stack.push(expResult);
    } 
    //evaluate square root 
    else if (postfix[i] === root) {
      const sqrtBase = '2';
      const val = stack.pop();
      stack.push(customRootLogic(val, sqrtBase) || Math.sqrt(val));
    } 
    //evaluate nth root
    else if (postfix[i].endsWith(root)) {
      const val = stack.pop();
      stack.push(customRootLogic(val, rootOfValue(postfix[i])));
    } 
    //evaluate logarithm
    else if (postfix[i] === logFunctions.log || postfix[i] === logFunctions.ln) {
      const logarithmNum = stack.pop();
      const logarithmBase = stack.pop();
      stack.push(calculateLogarithm(logarithmBase, logarithmNum));
    } 
    //evaluate percentage
    else if (postfix[i] === percent) {
      const percent = stack.pop();  // e.g. 5
      const base = stack[stack.length - 1]; // peek, don’t pop
      const lastOperator = postfix[i + 1];
      if(lastOperator == plus || lastOperator == minus){
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
    else if(trigFunctions.includes(postfix[i])){
        const result = calculateTrig(postfix[i], stack.pop(), getMode());
        stack.push(result);
    }
    //evaluate combination
    else if(postfix[i] === combinatorics.combination){
      const r = stack.pop();
      const n = stack.pop();
      console.log(n, r);
      const result = evaluateComb(n, r);
      stack.push(result);
    }
    //evaluate permutation
    else if(postfix[i] === combinatorics.permutation){
      const r = stack.pop();
      const n = stack.pop();
      console.log(n, r);
      const result = evaluatePerm(n, r);
      stack.push(result);
    }
    //addition, substraction, multiplication, division (+, -, *, /)
    else {
      const b = stack.pop();
      const a = stack.pop();
      switch (postfix[i]) {
        case plus: stack.push(a + b); break;
        case minus: stack.push(a - b); break;
        case multiplyBy: stack.push(a * b); break;
        // case '/': stack.push(a / b); break;
        case divideBy: {
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