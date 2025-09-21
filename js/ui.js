import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate} from './calculation.js';
import {insertValueInsideBracket, showExponentBox, showExponent, replaceOperator} from './insertion.js';
import {operatorsSet, superscripts} from './constants.js';
import {caretShow, caretIndex} from './caretAndArrow.js';

export const input = document.querySelector('.input_field');
const button = document.querySelectorAll('.btn');
const messageDiv = document.querySelector('.messageDiv');

function defaultMessage(){
  messageDiv.textContent = 'Message: All is well';
}

//this function is for DOM manipulation/change or not on the UI, based on user response
export function init(){
  // input.focus();
  caretShow(input);
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;
      const lastChar = input.textContent[input.textContent.length - 1];
      console.log(value);

      //AC button logic
      if(value === 'AC'){
        defaultMessage();
        input.textContent = '';
        caretShow(input);
        return;
      }

      //Cen button logic
      if (value === 'Cen') {
        //   if (input.textContent !== 'Invalid Input') {
        //   input.textContent = input.textContent.slice(0, -1);
        //   return;
        // }
        // return;
        defaultMessage();
        input.textContent = input.textContent.slice(0, -1);
        caretShow(input);
        return;
      }

      //to insert input inside bracket
      if(lastChar === ')' && value !== '=') {
        // input.textContent = insertValueInsideBracket(input, input.textContent, value);
        input.innerHTML = insertValueInsideBracket(input.textContent, value);
        return;
      }

      // to show exponents
      // const operators = new Set(['+', '-', '*', '/']);
      // const superscripts = new Set([
      //   "\u2070", "\u00B9", "\u00B2", "\u00B3",
      //   "\u2074", "\u2075", "\u2076", "\u2077",
      //   "\u2078", "\u2079"
      // ]);

      if(value.includes("□")) {
        // if(operators.has(lastChar)) {
        //   return; // invalid case
        // }
        // if(!superscripts.has(lastChar)) {
        //   input.innerHTML = showExponentBox(input.textContent, value);
        //   return;
        // }
        if(validateForDisplay(input.textContent, value).allowed && !superscripts.has(lastChar)){
          input.innerHTML = showExponentBox(input.textContent, value);
          return;
        }
      }

      if(["□"].includes(lastChar)){ 
        input.innerHTML = showExponent(input.textContent, value);
        return;
      }

      if(superscripts.has(lastChar) && value !== '=' && !operatorsSet.has(value)){
        input.innerHTML = showExponent(input.textContent, value);
        return;
      }

      //equal button logic, first validate then calculate
      if(value === '='){
        const validatedForEval = validateForEvaluation(input.textContent, value);
        if(validatedForEval.allowed){
          input.textContent = calculate(input.textContent);
          return;
        }
        return;
      }

      //for validation, validate first before change anything on the input section
      const validatedValue = validateForDisplay(input.textContent, value);
      // if(validatedValue !== null){
      //   input.textContent = validatedValue;
      // }
      if(validatedValue.allowed){
        defaultMessage();
        input.textContent += value;
        caretShow(input, input.textContent.length);
        // console.log(caretIndex(input));
        return;
      }
      if(validatedValue.action === 'replace'){
        defaultMessage();
        input.textContent = replaceOperator(input.textContent, value);
        caretShow(input);
        return;
      }
      else{
        messageDiv.textContent = validatedValue.message;
        return;
        // if(messageDiv.textContent !== validatedValue.message){
        //   messageDiv.textContent = validatedValue.message;
        // }else{
        //   messageDiv.textContent = validatedValue.message;
        // }
      }
    })
  })
}