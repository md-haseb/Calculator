import {isOperator} from './validation.js';

const operators = '+*/-';

//for tokenize/making array of numbers and operators
export function tokenize(expr){
  return expr.match(/\d+(\.\d+)?|[+\-*/√]/g);
}

//this function is for calculation
export function calculate(expression){
  const tokens = tokenize(expression);
  // let result = '';

  //this loop evaluates square root in the expression
  for(let i = 0; i < tokens.length; i++){
    if(tokens[i] === '√'){
      const rootNumber = Number(tokens[i + 1]);
      let result = '';

      if(rootNumber === 0 || rootNumber === 1){
        result = rootNumber;
        tokens.splice(i, 2, result);
        continue;
      }

      let bigHalf = Math.max(1, rootNumber);
      let smallHalf = 0;
      let iterations = 0;

      while(true){
        if(++iterations > 1000) break;

        const average = (bigHalf + smallHalf) / 2;
        const square = average * average;
        const epsilon = 1e-10;
        if(Math.abs(square - rootNumber) < epsilon){
          result = average;
          tokens.splice(i, 2, result);
          break;
        }
        if(square > rootNumber){
          bigHalf = average;
        }
        if(square < rootNumber){
          smallHalf = average;
        }
      }
    }
  }

  //this loop evaluates 'multiplication and division' first in the expression
  for(let i = 0; i < tokens.length; i++){
    let result = '';
    if(tokens[i] === '*'){
      result = Number(tokens[i - 1]) * Number(tokens[i + 1]);
      tokens.splice(i - 1, 3, result);
      i--;
    }
    if(tokens[i] === '/'){
      result = Number(tokens[i - 1]) / Number(tokens[i + 1]);
      tokens.splice(i - 1, 3, result);
      i--;
    }
  }

  //this loop evaluates 'addition and substraction' in the expression
  for(let i = 0; i < tokens.length; i++){
    let result = '';
    if(tokens[i] === '+'){
      result = Number(tokens[i - 1]) + Number(tokens[i + 1]);
      tokens.splice(i - 1, 3, result);
      i--;
    }
    if(tokens[i] === '-'){
      result = Number(tokens[i - 1]) - Number(tokens[i + 1]);
      tokens.splice(i - 1, 3, result);
      i--;
    }
  }   
  //this will return the final result of the expression
  return tokens[0].toString();
}