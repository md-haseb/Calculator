let input = document.querySelector('.input_field');
let button = document.querySelectorAll('.btn');

showAndCalculate();

function showAndCalculate(){
  button.forEach((b, index) => {
    b.addEventListener('click', () => {
      if(b.textContent === '=' && input.value !== ''){
        input.value = eval(input.value);
      }
      else if(b.textContent === '=' && input.value == ''){
        input.value = '';
      }
      else if(b.textContent === 'AC'){
        input.value = '';
      }
      else if(b.textContent === 'Cen'){
        input.value = input.value.slice(0, input.value.length - 1);
      }
      else if(input.value == '' && (b.textContent === '+' || b.textContent === '-' || b.textContent === '*' || b.textContent === '/' || b.textContent === '.')){
        input.value = '';
      }
      else{
        input.value += b.textContent;
      }
    })
  })
}
