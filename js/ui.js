import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate} from './calculation.js';
import {insertValueInsideBracket} from './insertion.js';

const input = document.querySelector('.input_field');
const button = document.querySelectorAll('.btn');

//this function is for DOM manipulation/change or not on the UI, based on user response
export function init(){
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;
      const lastChar = input.value[input.value.length - 1];

      //AC button logic
      if(value === 'AC'){
        input.value = '';
        return;
      }

      //Cen button logic
      if (value === 'Cen') {
          if (input.value !== 'Invalid Input') {
          input.value = input.value.slice(0, -1);
          return;
        }
        return;
      }

      //to insert input inside bracket
      if(lastChar === ')' && value !== '=') {
        input.value = insertValueInsideBracket(input.value, value);
        return;
      }

      if(value.includes("□")){ 
        // btn.innerHTML = `X<sup>\u25A1</sup>`;
        input.value = "X&#x25A1";
      }


      //equal button logic, first validate then calculate
      if(value === '='){
        const validatedForEval = validateForEvaluation(input.value, value);
        if(validatedForEval !== null){
          input.value = calculate(input.value);
          return;
        }
        return;
      }

      //for validation, validate first before change anything on the input section
      const validatedValue = validateForDisplay(input.value, value);
      if(validatedValue !== null){
        input.value = validatedValue;
      }
    })
  })
}