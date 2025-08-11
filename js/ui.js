import {validateForDisplay} from './validation.js';

const input = document.querySelector('.input_field');
const button = document.querySelectorAll('.btn');

export function init(){
  button.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.textContent;
      if(value === 'AC'){
        input.value = '';
        return;
      }
      if(value === 'Cen'){
        input.value = input.value.slice(0, -1);
        return;
      }
      if(value === '='){

      }
      if(validateForDisplay(input.value, value)){
        input.value += value;
      }
    })
  })
}