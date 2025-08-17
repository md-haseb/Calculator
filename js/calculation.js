import {isOperator} from './validation.js';

const operators = '+*/-';

//for tokenize/making array of numbers and operators
export function tokenize(expr){
  return expr.match(/\d+(\.\d+)?|[+\-*/√]/g);
}

//this function is for calculation
export function calculate(expression){
  const tokens = tokenize(expression);

  //this loop evaluates square root in the expression
  for(let i = 0; i < tokens.length; i++){
    if(tokens[i] === '√'){
      const rootNumber = Number(tokens[i + 1]);
      let result = '';

      if(rootNumber === 0 || rootNumber === 1){   //if user type 0 and 1 after root
        result = rootNumber;
        tokens.splice(i, 2, result);
        continue;
      }

      let high = Math.max(1, rootNumber);   //finding the square root using binary search algorithm
      let low = 0;
      let iterations = 0;

      while(true){
        if(++iterations > 1000) break;

        const average = (high + low) / 2;
        const square = average * average;
        const epsilon = 1e-10;
        if(Math.abs(square - rootNumber) < epsilon || (high - low) < epsilon){
          result = Math.round(average * 1e11) / 1e11;
          tokens.splice(i, 2, result);
          break;
        }
        if(square > rootNumber){
          high = average;
        }
        if(square < rootNumber){
          low = average;
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