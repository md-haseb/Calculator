import {validateForDisplay, validateForEvaluation} from './validation.js';
import {calculate} from './calculation.js';
import {insertValue, replaceOperator} from './insertion.js';
import {operatorsSet, superscripts} from './constants.js';
import {caretShowWithFocus, caretIndex} from './caretAndArrow.js';

export const input = document.querySelector(".input_field");
const buttons = document.querySelectorAll(".btn");
const messageDiv = document.querySelector(".messageDiv");

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

      // Cen button
      if (value === "Cen") {
        showMessage();
        if(caretPosition == 0){
          caretShowWithFocus(input, caretPosition);
          return;
        }
        input.textContent = input.textContent.slice(0, caretPosition - 1) + input.textContent.slice(caretPosition);
        caretShowWithFocus(input, caretPosition - 1);
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

      // Equal button
      if (value === "=") {
        const validated = validateForEvaluation(input.textContent, value);
        if (validated.allowed) {
          input.textContent = calculate(input.textContent);
          caretShowWithFocus(input, input.textContent.length);
        }
        return;
      }

      // Validate before insertion
      const validated = validateForDisplay(input.textContent, value);
      showMessage();

      if (validated.allowed){
        // caret movement
        if (value === "<") {
          caretShowWithFocus(input, caretPosition - 1);
          return;
        }
        if (value === ">") {
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