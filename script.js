let input = document.querySelector('.input_field');
let button = document.querySelectorAll('.btn');

showAndCalculate();

function showAndCalculate(){
  const operators = '+-*/.';
  button.forEach((b, index) => {
    b.addEventListener('click', () => {
      //calculation logic
      if(b.textContent === '=' && input.value !== ''){
        input.value = eval(input.value);
      }
      else if(b.textContent === '=' && input.value == ''){
        input.value = '';
      }
      //AC button logic
      else if(b.textContent === 'AC'){
        input.value = '';
      }
      //Cen Button logic
      else if(b.textContent === 'Cen'){
        input.value = input.value.slice(0, input.value.length - 1);
      }
      //"Logic: Do not display operator first when input is empty"
      else if(input.value == '' && (b.textContent === '+' || b.textContent === '-' || b.textContent === '*' || b.textContent === '/' || b.textContent === '.')){
        input.value = '';
      }
      //"Logic: Do not display same operator twice"
      else if(b.textContent === input.value[input.value.length - 1] && operators.includes(input.value[input.value.length - 1])){
        input.value += '';
      }
      //"Logic: Do not display operators side by side"
      else if(operators.includes(input.value[input.value.length - 1]) && operators.includes(b.textContent)){
        input.value += '';
      }
      //"Logic: After an operator display further, if the input is not an operator again"
      else if(operators.includes(input.value[input.value.length - 1]) && !operators.includes(b.textContent)){
        input.value += b.textContent;
      }
      //Update input value based on user button click
      else{
        input.value += b.textContent;
      }
    })
  })
}
