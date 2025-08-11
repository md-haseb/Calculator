

const operators = '+*/-';
const decimal = '.';

function isOperator(char){
  return operators.includes(char);
}

export function validateForDisplay(currentInput, newValue){
  //Do not display operator first when input is empty except - and .
  if(currentInput == '' && isOperator(newValue) && !['-', decimal].includes(newValue)){
    return false;
  }

  const lastChar = currentInput[currentInput.length - 1];
  const regex = new RegExp(`[${operators}]`);

  //"Logic: Do not display same operator twice"
  if((newValue === lastChar && (isOperator(lastChar) || decimal.includes(lastChar)))){
    return false;
  }

  //Logic: After an operator, . is permitted once because it can precede a number (Group A: Order 1)
  if(isOperator(lastChar) && newValue === decimal){
    currentInput += newValue;
  }

  //Logic: Do not permit . twice for a number
  if(newValue === decimal && currentInput !== ''){
    let filteredNumberArray = currentInput.split(regex);
    let lastElementOfArray = filteredNumberArray[filteredNumberArray.length - 1];
    if(!lastElementOfArray.includes(decimal)){
      currentInput += newValue;
    }
    else{
      return false;
    }
  }
  return true;
}