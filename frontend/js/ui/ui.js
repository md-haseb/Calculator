import {validateForDisplay, validateForEvaluation} from '../core/validation.js';
import {calculate, tokenize} from '../core/calculation.js';
import {insertValue, replaceOperator, getTokenAtCaret, getPrevToken, getNextToken} from '../editor/insertion.js';
import {operatorsSet, superscripts} from '../core/constants.js';
import {caretShowWithFocus, caretIndex} from '../editor/caretHandler.js';

/**
 * DOM elements
 */
export const input = document.querySelector(".input_display");
const buttons = document.querySelectorAll(".btn");
const messageDiv = document.querySelector(".message_display");

/**
 * Current angle mode: 'deg' or 'rad'
 */
let DegRadMode = 'deg';

/**
 * Display a message to the user
 * @param {string} msg - Message text
 */
function showMessage(msg = "Message: All is well") {
  messageDiv.textContent = msg;
}

/**
 * Initialize the calculator UI
 * - Sets caret position
 * - Adds event listeners for clicks on input and buttons
 */
export function init() {
  // Set initial caret focus
  caretShowWithFocus(input);

  /**
   * Handle mouse clicks on input display
   * - Moves caret according to click position
   * - For functions, caret jumps to the beginning of the function token
   */
  input.addEventListener('mousedown', (e) => {
    e.preventDefault();

    const clickedRange = document.caretPositionFromPoint(e.clientX, e.clientY);

    const tokens = tokenize(input.textContent);
    const currentToken = getTokenAtCaret(tokens, clickedRange.offset);

    const finalOffset = currentToken?.type === 'function' 
    ? currentToken.start 
    : clickedRange.offset;

    caretShowWithFocus(input, finalOffset);
  });

  /**
   * Handle button clicks
   */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.textContent;
      const caretPosition = caretIndex(input);
      const lastChar = input.textContent[caretPosition - 1];

      // ----------------------------
      // Clear button (AC)
      // ----------------------------
      if (value === "AC") {
        showMessage();
        input.textContent = "";
        caretShowWithFocus(input);
        return;
      }

      // ----------------------------
      // Delete button
      // ----------------------------
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

      // ----------------------------
      // Angle mode buttons (deg/rad)
      // ----------------------------
      if(value === 'rad' || value === 'deg'){
        setMode(value);
        return;
      }

      // ----------------------------
      // Insert functions (sin, cos, tan, log, ln)
      // ----------------------------
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

      // ----------------------------
      // Equal button
      // ----------------------------
      if (value === "=") {
        const validated = validateForEvaluation(input.textContent, value);
        if (validated.allowed) {
          const ModifiedInputText = changeMultiplySign();
          input.textContent = calculate(ModifiedInputText);
          caretShowWithFocus(input, input.textContent.length);
        }
        return;
      }

      // ----------------------------
      // Validate before insertion
      // ----------------------------
      const validated = validateForDisplay(input.textContent, value);
      showMessage();

      if (validated.allowed){
        // ------------------------
        // Arrow key logic
        // ------------------------
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

        // ------------------------
        // Universal insert logic
        // ------------------------
        const { newInput, newCaret } = insertValue(
          input.textContent,
          caretPosition,
          value
        );
        input.innerHTML = newInput;
        caretShowWithFocus(input, newCaret);
        return;
      }

      // ----------------------------
      // Replace operator logic
      // ----------------------------
      if (validated.action === "replace") {
        showMessage();
        input.textContent = replaceOperator(input.textContent, value);
        caretShowWithFocus(input, input.textContent.length);
        return;
      }

      // ----------------------------
      // Fallback for invalid input
      // ----------------------------
      showMessage(validated.message);
      caretShowWithFocus(input, caretPosition);
    });
  });
}

//helpers

/**
 * Helper: Replace '×' with '*' for calculation
 * @returns {string} Modified input text
 */
function changeMultiplySign(){
  let inpText = input.textContent;
  for(let i = 0; i < inpText.length; i++){
    if(inpText[i] === '×'){
      inpText = inpText.slice(0, i) + '*' + inpText.slice(i + 1);
    }
  }
  return inpText;
}

/**
 * Set angle mode ('deg' or 'rad')
 * @param {string} value
 */
function setMode(value){
  if (value === 'deg' || value === 'rad') {
    DegRadMode = value;
  } 
}

/**
 * Get current angle mode
 * @returns {string} 'deg' or 'rad'
 */
export function getMode(){
  return DegRadMode;
}