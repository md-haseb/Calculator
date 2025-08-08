let input = document.querySelector('.input_field');
let button = document.querySelectorAll('.btn');

showAndCalculate();

function showAndCalculate(){
  const operators = '+*/-';
  const decimal = '.';
  const regex = new RegExp(`[${operators}]`);
  button.forEach((b, index) => {
    b.addEventListener('click', () => {
      let lastChar = input.value[input.value.length - 1];
      //calculation logic
      if(b.textContent === '=' && input.value !== ''){
        let typedValues = input.value.match(/\d+(\.\d+)?|[+\-*/]/g);
        let result = '';
        for(let i = 0; i < typedValues.length - 1; i++){
          if(typedValues[i] === '*'){
            result = Number(typedValues[i - 1]) * Number(typedValues[i + 1]);
            typedValues.splice(i - 1, 3, result);
            i--;
          }
          if(typedValues[i] === '/'){
            result = Number(typedValues[i - 1]) / Number(typedValues[i + 1]);
            typedValues.splice(i - 1, 3, result);
            i--;
          }
        }
        for(let i = 0; i < typedValues.length - 1; i++){
          if(typedValues[i] === '+'){
            result = Number(typedValues[i - 1]) + Number(typedValues[i + 1]);
            typedValues.splice(i - 1, 3, result);
            i--;
          }
          if(typedValues[i] === '-'){
            result = Number(typedValues[i - 1]) - Number(typedValues[i + 1]);
            typedValues.splice(i - 1, 3, result);
            i--;
          }
        }
        input.value = typedValues.join('');
      }
      else if(b.textContent === '=' && input.value == ''){
        return;
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
      else if(input.value == '' && (b.textContent === '+' || b.textContent === '*' || b.textContent === '/')){
        return;
      }
      //"Logic: Do not display same operator twice"
      else if(b.textContent === lastChar && (operators.includes(lastChar) || decimal.includes(lastChar))){
        return;
      }
      //Logic: After an operator, . is permitted once because it can precede a number (Group A: Order 1)
      else if(operators.includes(lastChar) && b.textContent === decimal){
        input.value += b.textContent;
      }
      //Logic: Do not permit . twice for a number
      else if(b.textContent === decimal && input.value !== ''){
        let splittedArr = input.value.split(regex);
        let lastElementArr = splittedArr[splittedArr.length - 1];
        if(!lastElementArr.includes(decimal)){
          input.value += b.textContent;
        }
        else{
          return;
        }
      }
      //"Logic: Do not display operators side by side, replace with the new one" (Group A: Order 2)
      else if(operators.includes(lastChar) && operators.includes(b.textContent)){
        input.value = input.value.slice(0, -1) + b.textContent;
      }
      //"Logic: After an operator display further, if the input is not an operator again"
      else if(operators.includes(lastChar) && !operators.includes(b.textContent)){
        input.value += b.textContent;
      }
      //Update input value based on user button click
      else{
        input.value += b.textContent;
      }
    })
  })
}
