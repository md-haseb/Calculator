

const operators = '+*/-';
const decimal = '.';

//for checking, is character is an operator
export function isOperator(char){
  return operators.includes(char);
}

//this function is about validate and allow for display or not
export function validateForDisplay(currentInput, newValue){
  //Do not display operator first when input is empty except - and .
  if(currentInput == '' && isOperator(newValue) && !['-', decimal].includes(newValue)){
    return null;
  }

  const lastChar = currentInput[currentInput.length - 1];
  const regex = new RegExp(`[${operators}]`);

  //"Logic: Do not display same operator twice"
  if((newValue === lastChar && (isOperator(lastChar) || decimal.includes(lastChar)))){
    return null;
  }

  //Logic: After an operator, . is permitted once because it can precede a number (Group A: Order 1)
  if(isOperator(lastChar) && newValue === decimal){
    return currentInput + newValue;
  }

  //Logic: Do not permit . twice for a number
  if(newValue === decimal && currentInput !== ''){
    let filteredNumberArray = currentInput.split(regex);
    let lastElementOfArray = filteredNumberArray[filteredNumberArray.length - 1];
    if(!lastElementOfArray.includes(decimal)){
      return currentInput + newValue;
    }
    else{
      return null;
    }
  }

  //"Logic: Do not display operators side by side, replace with the new one" (Group A: Order 2)
  if(isOperator(lastChar) && isOperator(newValue)){
    return currentInput.slice(0, -1) + newValue;
  }

  //"Logic: After an operator display further, if the input is a number"
  if(isOperator(lastChar) && !isOperator(newValue)){
    return currentInput + newValue;
  }

  //Update input value based on user button click
  return currentInput + newValue;
}

//this function is about validate and allow for calculation
export function validateForEvaluation(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];

  //Logic: if last character is an operator/decimal then do nothing
  if(newValue === '=' && currentInput !== '' && (isOperator(lastChar) || decimal.includes(lastChar))){
    return null;
  }

  //Logic: when input value is empty, then do nothing
  if(newValue === '=' && currentInput == ''){
    return null;
  }

  //proceed for calculation
  return true;
}