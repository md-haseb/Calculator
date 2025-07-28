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
      else{
        input.value += b.textContent;
      }
    })
  })
}
