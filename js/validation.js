

const operators = '+*/-';
const root = '√';
const decimal = '.';

//for checking, is character is an operator
export function isOperator(char){
  return operators.includes(char);
}

//this function is about validate and allow for display or not
export function validateForDisplay(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];
  const regex = new RegExp(`[${operators}]`);

  //Do not display operator first when input is empty (except - and .)
  if(currentInput == '' && isOperator(newValue) && !['+','-', root, decimal].includes(newValue)){
    return {allowed: false, message: 'Message: Operators like (*, /,) are not allowed when input is empty'};
  }

  //"Logic: Do not display same operator twice in a row"
  // if((newValue === lastChar && (isOperator(lastChar) || decimal.includes(lastChar) || root === lastChar))){
  //   return {allowed: false, message: 'Message: Same operator twice in a row is not allowed'};
  // }

  if(newValue === lastChar){
    if(isOperator(lastChar)){
      return {allowed: false, message: 'Message: Same operator twice in a row is not allowed'};
    }
    if(decimal.includes(lastChar)){
      return {allowed: false, message: 'Message: Two decimal in a row is not allowed'};
    }
    if(root === lastChar){
      return {allowed: false, message: 'Message: Two root symbol in a row is not allowed'};
    }
  }

  //Logic: After an operator, . is permitted once because it can precede a number (Group A: Order 1)
  // if(isOperator(lastChar) && newValue === decimal){
  //   return currentInput + newValue;
  // }

  //Logic: Prevent multiple decimals in the same number
  // if(newValue === decimal && currentInput !== '' && !(currentInput === 'Invalid Input') && lastChar !== ')'){
  //   let filteredNumberArray = currentInput.split(regex);
  //   let lastElementOfArray = filteredNumberArray[filteredNumberArray.length - 1];
  //   if(!lastElementOfArray.includes(decimal)){
  //     return currentInput + newValue;
  //   }
  //   else{
  //     return null;
  //   }
  // }
  if(newValue === decimal && currentInput !== '' && !(currentInput === 'Invalid Input') && lastChar !== ')'){
    let filteredNumberArray = currentInput.split(regex);
    let lastElementOfArray = filteredNumberArray[filteredNumberArray.length - 1];
    if(lastElementOfArray.includes(decimal)){
      return {allowed: false, message: 'Message: Multiple decimal in the same number is not allowed'};
    }
  }

  //"Logic: Do not display operators side by side, replace with the new one" (Group A: Order 2)
  // but, if the operators are *, /, root then don't replace
  if(isOperator(lastChar) && isOperator(newValue)){
    // if(['*','/', root].includes(newValue)){
    //   return false;
    // }
    // return currentInput.slice(0, -1) + newValue;
    return 'replace';
  }

  //after a root, operators are not allowed
  if(lastChar === root && isOperator(newValue)){
    return {allowed: false, message: 'Message: Operators are not allowed after root'};
  }

  //when input value is only +/-/. then don't allow root to display
  if(currentInput.length == 1 && ['+','-', decimal].includes(lastChar) && newValue === root){
    return {allowed: false, message: 'Message: root is not allowed after single (+, -, decimal)'};
  }

  //"Logic: After an operator display further, if the input is a number"
  // if(isOperator(lastChar) && !isOperator(newValue)){
  //   return currentInput + newValue;
  // }

  //when input value is 'Invalid Input', do nothing instead of AC button
  // if(currentInput === 'Invalid Input'){
  //   return null;
  // }

  // if(!(operators.includes(lastChar) || root === lastChar || decimal === lastChar) && newValue.includes("□")){
  //   return true;
  // }

  if((operators.includes(lastChar) || root === lastChar || decimal === lastChar) && newValue.includes("□")){
    return {allowed: false, message: 'Message: taking exponent is not allowed if last character is not number'};
  }

  //Update input value based on user button click
  return {allowed: true};
}

//this function is about validate and allow for calculation
export function validateForEvaluation(currentInput, newValue){
  const lastChar = currentInput[currentInput.length - 1];

  //Logic: if last character is an operator/decimal then do nothing
  // if(newValue === '=' && currentInput !== '' && (isOperator(lastChar) || decimal.includes(lastChar))){
  //   return null;
  // }

  //Logic: when input value is empty, then do nothing
  // if(newValue === '=' && currentInput == ''){
  //   return null;
  // }

  if(newValue === '=' && (currentInput === '' || isOperator(lastChar) || lastChar === decimal)){
    return {allowed: false, message: 'Message: Calculation is not allowed if input is empty or last character is operator or decimal'};
  }

  //proceed for calculation
  return {allowed: true};
}