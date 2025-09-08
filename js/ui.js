import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate} from './calculation.js';
import {insertValueInsideBracket, showExponentBox, showExponent} from './insertion.js';

const input = document.querySelector('.input_field');
const button = document.querySelectorAll('.btn');

//this function is for DOM manipulation/change or not on the UI, based on user response
export function init(){
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;
      const lastChar = input.textContent[input.textContent.length - 1];
      console.log(value);

      //AC button logic
      if(value === 'AC'){
        input.textContent = '';
        return;
      }

      //Cen button logic
      if (value === 'Cen') {
          if (input.textContent !== 'Invalid Input') {
          input.textContent = input.textContent.slice(0, -1);
          return;
        }
        return;
      }

      //to insert input inside bracket
      if(lastChar === ')' && value !== '=') {
        input.textContent = insertValueInsideBracket(input.textContent, value);
        return;
      }

      if(value.includes("□")){ 
        showExponentBox(input, input.textContent, value);
        return;
      }

      if(["□"].includes(lastChar)){
        showExponent(input, input.textContent, value);
        return;
      }

      const superscripts = new Set([
        "\u2070", "\u00B9", "\u00B2", "\u00B3",
        "\u2074", "\u2075", "\u2076", "\u2077",
        "\u2078", "\u2079"
      ]);

      if(superscripts.has(lastChar) && value !== '=' && !['+', '-', '*', '/'].includes(value)){
        showExponent(input, input.textContent, value);
        return;
      }

      //equal button logic, first validate then calculate
      if(value === '='){
        console.log(input.textContent);
        const validatedForEval = validateForEvaluation(input.textContent, value);
        if(validatedForEval !== null){
          input.textContent = calculate(input.textContent);
          return;
        }
        return;
      }

      //for validation, validate first before change anything on the input section
      const validatedValue = validateForDisplay(input.textContent, value);
      if(validatedValue !== null){
        input.textContent = validatedValue;
      }
    })
  })
}