let input = document.querySelector('.input_field');
let button = document.querySelectorAll('.btn');

showAndCalculate();

function showAndCalculate(){
  button.forEach((b, index) => {
    b.addEventListener('click', () => {
      input.value += b.textContent;
    })
  })
}
