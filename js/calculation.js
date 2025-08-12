

const operators = '+*/-';

//for tokenize/making array of numbers and operators
export function tokenize(expr){
  return expr.match(/\d+(\.\d+)?|[+\-*/]/g);
}

//this function is for calculation
export function calculate(expression){
  const tokens = tokenize(expression);
  let result = '';

  //this loop evaluates 'multiplication and division' first in the expression
  for(let i = 0; i < tokens.length; i++){
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