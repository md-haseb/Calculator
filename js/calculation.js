

const operators = '+*/-';

export function tokenize(expr){
  return expr.match(/\d+(\.\d+)?|[+\-*/]/g);
}

function calculate(expression){
  const tokens = tokenize(expression);
  let result = '';

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

  return tokens[0].toString();
}