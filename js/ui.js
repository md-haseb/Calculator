import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate, tokenize} from './calculation.js';
import {insertValue, replaceOperator, getTokenAtCaret, getPrevToken, getNextToken} from './insertion.js';
import {operatorsSet, superscripts} from './constants.js';
import {caretShowWithFocus, caretIndex} from './caretAndArrow.js';

export const input = document.querySelector(".input_display");
const buttons = document.querySelectorAll(".btn");
const messageDiv = document.querySelector(".message_display");

let DegRadMode = 'deg';

function showMessage(msg = "Message: All is well") {
  messageDiv.textContent = msg;
}

export function init() {
  caretShowWithFocus(input);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.textContent;
      const caretPosition = caretIndex(input);
      const lastChar = input.textContent[caretPosition - 1];

      // AC button
      if (value === "AC") {
        showMessage();
        input.textContent = "";
        caretShowWithFocus(input);
        return;
      }

      //delete button
      if (btn.classList.contains('delete_btn')) {
        showMessage();
        if(caretPosition == 0){
          caretShowWithFocus(input, caretPosition);
          return;
        }
        input.textContent = input.textContent.slice(0, caretPosition - 1) + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition - 1);
        return;
      }

      if(value === 'rad' || value === 'deg'){
        setMode(value);
        return;
      }

      if(value === 'sin'){
        showMessage();
        input.textContent = input.textContent.slice(0, caretPosition)+ 'sin()' + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition + 4);
        return;
      }

      if(value === 'cos'){
        showMessage();
        input.textContent = input.textContent.slice(0, caretPosition)+ 'cos()' + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition + 4);
        return;
      }

      if(value === 'tan'){
        showMessage();
        input.textContent = input.textContent.slice(0, caretPosition)+ 'tan()' + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition + 4);
        return;
      }

      if(value === 'log'){
        showMessage();
        input.textContent = input.textContent.slice(0, caretPosition)+ 'log()' + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition + 4);
        return;
      }

      if(value === 'ln'){
        showMessage();
        input.textContent = input.textContent.slice(0, caretPosition)+ 'ln()' + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition + 3);
        return;
      }

      // Equal button
      if (value === "=") {
        const validated = validateForEvaluation(input.textContent, value);
        if (validated.allowed) {
          const ModifiedInputText = changeMultiplySign();
          input.textContent = calculate(ModifiedInputText);
          caretShowWithFocus(input, input.textContent.length);
        }
        return;
      }

      // Validate before insertion
      const validated = validateForDisplay(input.textContent, value);
      showMessage();

      if (validated.allowed){
        // caret movement based on token
        if (btn.classList.contains('left_arrow')) {
          const tokens = tokenize(input.textContent);
          const currentToken = getTokenAtCaret(tokens, caretPosition);
          const prevToken = getPrevToken(tokens, currentToken);
          if(currentToken?.type === 'parenOpen' && prevToken?.type === 'function' && prevToken?.value === 'ln'){
            caretShowWithFocus(input, caretPosition - 3);
            return;
          }
          if(currentToken?.type === 'parenOpen' && prevToken?.type === 'function'){
            caretShowWithFocus(input, caretPosition - 4);
            return;
          }
          caretShowWithFocus(input, caretPosition - 1);
          return;
        }
        if (btn.classList.contains('right_arrow')) {
          const tokens = tokenize(input.textContent);
          const currentToken = getTokenAtCaret(tokens, caretPosition);
          const nextToken = getNextToken(tokens, currentToken);
          if(nextToken?.type === 'function' && nextToken?.value === 'ln'){
            caretShowWithFocus(input, caretPosition + 3);
            return;
          }
          if(nextToken?.type === 'function'){
            caretShowWithFocus(input, caretPosition + 4);
            return;
          }
          caretShowWithFocus(input, caretPosition + 1);
          return;
        }

        // universal insert logic
        const { newInput, newCaret } = insertValue(
          input.textContent,
          caretPosition,
          value
        );
        input.innerHTML = newInput;
        caretShowWithFocus(input, newCaret);
        return;
      }
      if (validated.action === "replace") {
        showMessage();
        input.textContent = replaceOperator(input.textContent, value);
        caretShowWithFocus(input, input.textContent.length);
        return;
      }

      // fallback: invalid
      showMessage(validated.message);
      caretShowWithFocus(input, caretPosition);
    });
  });
}

//helpers
function changeMultiplySign(){
  let inpText = input.textContent;
  for(let i = 0; i < inpText.length; i++){
    if(inpText[i] === '×'){
      inpText = inpText.slice(0, i) + '*' + inpText.slice(i + 1);
    }
  }
  return inpText;
}

function setMode(value){
  if (value === 'deg' || value === 'rad') {
    DegRadMode = value;
  } 
}

export function getMode(){
  return DegRadMode;
}