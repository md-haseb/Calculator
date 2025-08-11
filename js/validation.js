

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
    return true;
  }

  //Logic: Do not permit . twice for a number
  if(newValue === decimal && currentInput !== ''){
    let filteredNumberArray = currentInput.split(regex);
    let lastElementOfArray = filteredNumberArray[filteredNumberArray.length - 1];
    if(!lastElementOfArray.includes(decimal)){
      return true;
    }
    else{
      return false;
    }
  }

  //"Logic: Do not display operators side by side, replace with the new one" (Group A: Order 2)
  if(isOperator(lastChar) && isOperator(newValue)){
    return currentInput.slice(0, -1) + newValue;
  }
  return currentInput + newValue;
}

// export function updateForDisplay(currentInput, newValue){
//   const lastChar = currentInput[currentInput.length - 1];
//   if(isOperator(lastChar) && isOperator(newValue)){
//     return currentInput.slice(0, -1) + newValue;
//   }
//   return currentInput;
// }