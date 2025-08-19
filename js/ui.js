import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate} from './calculation.js';

const input = document.querySelector('.input_field');
const button = document.querySelectorAll('.btn');

//this function is for DOM manipulation/change or not on the UI, based on user response
export function init(){
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;

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

      // if (value === '()') {
      //   // input.value = input.value + '(' + ')';
      //   input.value = input.value + '()';
      //   input.setSelectionRange(input.value.length - 1, input.value.length - 1);
      //   input.focus();
      //   return;
      // }


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