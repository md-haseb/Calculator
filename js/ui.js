import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate} from './calculation.js';
import {insertValueInsideBracket, showExponentBox, showExponent, replaceOperator} from './insertion.js';
import {operatorsSet, superscripts} from './constants.js';
import {caretShowWithFocus, caretIndex} from './caretAndArrow.js';

export const input = document.querySelector('.input_field');
const button = document.querySelectorAll('.btn');
const messageDiv = document.querySelector('.messageDiv');

function showMessage(msg = 'Message: All is well'){
  messageDiv.textContent = msg;
}

//this function is for DOM manipulation/change or not on the UI, based on user response
export function init(){
  // input.focus();
  caretShowWithFocus(input);
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;
      const lastChar = input.textContent[input.textContent.length - 1];
      const caretPosition = caretIndex(input);
      console.log(value);

      //AC button logic
      if(value === 'AC'){
        showMessage();
        input.textContent = '';
        caretShowWithFocus(input);
        return;
      }

      //Cen button logic
      if (value === 'Cen') {
        //   if (input.textContent !== 'Invalid Input') {
        //   input.textContent = input.textContent.slice(0, -1);
        //   return;
        // }
        // return;
        showMessage();
        input.textContent = input.textContent.slice(0, -1);
        caretShowWithFocus(input);
        return;
      }

      //to insert input inside bracket
      // if(lastChar === ')' && !['=', '<', '>'].includes(value) && caretPosition < input.textContent.length){
      //   // input.textContent = insertValueInsideBracket(input, input.textContent, value);
      //   input.innerHTML = insertValueInsideBracket(input.textContent, value);
      //   caretShowWithFocus(input, caretPosition + 1);
      //   return;
      // }

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
          caretShowWithFocus(input, caretPosition);
          return;
        }
      }

      if(["□"].includes(lastChar)){ 
        input.innerHTML = showExponent(input.textContent, value);
        caretShowWithFocus(input, caretPosition + 1);
        return;
      }

      if(superscripts.has(lastChar) && value !== '=' && !operatorsSet.has(value)){
        input.innerHTML = showExponent(input.textContent, value);
        caretShowWithFocus(input, caretPosition + 1);
        return;
      }

      // const caretPosition = caretIndex(input);
        // if(value === '<'){
        //   moveCaretLeft(input);
        //   return;
        // }
        // if(value === '>'){
        //   moveCaretRight(input);
        //   return;
        // }

      //equal button logic, first validate then calculate
      if(value === '='){
        const validatedForEval = validateForEvaluation(input.textContent, value);
        if(validatedForEval.allowed){
          input.textContent = calculate(input.textContent);
          caretShowWithFocus(input, caretPosition);
          return;
        }
        return;
      }

      //for validation, validate first before change anything on the input section
      const validatedValue = validateForDisplay(input.textContent, value);
      // const caretPosition = caretIndex(input);
      // if(validatedValue !== null){
      //   input.textContent = validatedValue;
      // }
      if(validatedValue.allowed){
        if(value === '<'){
          moveCaretLeft(input);
          return;
        }
        if(value === '>'){
          moveCaretRight(input);
          return;
        }
        if(value === '()'){
          input.innerHTML = insertValueInsideBracket(input.textContent, value);
          caretShowWithFocus(input, caretPosition + 1);
          return;
        }
        if(caretPosition === input.textContent.length){
          showMessage();
          input.textContent += value;
          caretShowWithFocus(input, input.textContent.length);
          // console.log(caretIndex(input));
          return;
        }else{
          showMessage();
          input.textContent = input.textContent.slice(0, caretPosition) + value + input.textContent.slice(caretPosition);
          caretShowWithFocus(input, caretPosition + 1);
          return;
        }
      }
      if(validatedValue.action === 'replace'){
        showMessage();
        input.textContent = replaceOperator(input.textContent, value);
        caretShowWithFocus(input);
        return;
      }
      else{
        showMessage(validatedValue.message);
        caretShowWithFocus(input, caretPosition);
        return;
      }
    })
  })
}

function moveCaretLeft(inputElm) {
  const caretPosition = caretIndex(input);
  caretShowWithFocus(inputElm, caretPosition - 1);
}

function moveCaretRight(inputElm) {
  const caretPosition = caretIndex(input);
  caretShowWithFocus(inputElm, caretPosition + 1);
}