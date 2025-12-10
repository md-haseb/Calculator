import {validateForDisplay, validateForEvaluation} from '../core/validation.js';
import {classifyButton} from '../core/classifyBtn.js';
import {insertValue, replaceOperator} from '../editor/insertion.js';
import {caretShowWithFocus, caretIndex} from '../editor/caretHandler.js';
import {handleAC, handleDelete, handleEqual, handleFunctions, handleInputClick, handleLeftArrow, handleRightArrow} from "../editor/inputController.js";

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
    const finalOffset = handleInputClick(input, clickedRange);
    caretShowWithFocus(input, finalOffset);
  });

  /**
   * Handle button clicks
   */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const clickedBtn = classifyButton(btn);
      const caretPosition = caretIndex(input);
      // const lastChar = input.textContent[caretPosition - 1];

      // ----------------------------
      // Clear button (AC)
      // ----------------------------
      if (clickedBtn.type === 'ac') {
        console.log(clickedBtn.type, clickedBtn.value);
        const {newInput, newCaret, showMsg} = handleAC();
        if(showMsg) showMessage();
        input.textContent = newInput;
        caretShowWithFocus(input, newCaret);
        return;
      }

      // ----------------------------
      // Delete button
      // ----------------------------
      if (clickedBtn.type === 'delete') {
        console.log(clickedBtn.type, clickedBtn.value);
        const {newInput, newCaret, showMsg} = handleDelete(input.textContent, caretPosition);
        if (showMsg) showMessage();
        input.textContent = newInput;
        caretShowWithFocus(input, newCaret);
        return;
      }

      // ----------------------------
      // Angle mode buttons (deg/rad)
      // ----------------------------
      if(clickedBtn.type === 'radian' || clickedBtn.type === 'degree'){
        console.log(clickedBtn.type, clickedBtn.value);
        setMode(clickedBtn.value);
        return;
      }

      // ----------------------------
      // Insert functions (sin, cos, tan, log, ln)
      // ----------------------------
      if(clickedBtn.type === 'function'){
        console.log(clickedBtn.type, clickedBtn.value);
        const {newInput, newCaret, showMsg} = handleFunctions(clickedBtn.value, input.textContent, caretPosition);
        if (showMsg) showMessage();
        input.textContent = newInput;
        caretShowWithFocus(input, newCaret);
        return;
      }

      // ----------------------------
      // Equal button
      // ----------------------------
      if (clickedBtn.type === 'equal') {
        console.log(clickedBtn.type, clickedBtn.value);
        const validated = validateForEvaluation(input.textContent, clickedBtn.value);
        if (validated.allowed) {
          const ModifiedInputText = changeMultiplySign();
          const {newInput, newCaret, showMsg} = handleEqual(ModifiedInputText);
          if(showMsg) showMessage();
          input.textContent = newInput;
          caretShowWithFocus(input, newCaret);
        }
        return;
      }

      // ------------------------
      // Arrow key logic
      // ------------------------

      if (clickedBtn.type === 'leftArrow') {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleLeftArrow(input.textContent, caretPosition);
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
      }

      if (clickedBtn.type === 'rightArrow') {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleRightArrow(input.textContent, caretPosition);
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
      }

      // ----------------------------
      // Validate before insertion
      // ----------------------------
      const validated = validateForDisplay(input.textContent, clickedBtn.value);
      // showMessage();

      if (validated.allowed){
        // ------------------------
        // Universal insert logic
        // ------------------------
        const { newInput, newCaret } = insertValue(
          input.textContent,
          caretPosition,
          clickedBtn.value
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
        input.textContent = replaceOperator(input.textContent, clickedBtn.value);
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