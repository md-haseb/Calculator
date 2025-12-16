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

const angleToggleContainer = document.querySelector(".radDegToggle");
const themeToggleContainer = document.querySelector(".theme_toggle");
const themeToggleButtons = document.querySelectorAll(".theme_toggle_btn");

/**
 * Current angle mode: 'deg' or 'rad'
 * Current theme : 'dark' or 'light'
 */
// let DegRadMode = 'deg';
const state = {
  theme: 'light',
  angle: 'deg',
}

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
   * Handle theme toggle button clicks
   */

  themeToggleButtons.forEach( btn => {
    btn.addEventListener('click', () => {
      const clickedBtn = classifyButton(btn);

      switch(clickedBtn.type) {
        // ------------------------------------
        // Theme Selection buttons (dark/light)
        // ------------------------------------
        case "dark":
        case "light": {
        console.log(clickedBtn.type, clickedBtn.value);
        setState(themeToggleContainer, 'theme');
        return;
        }
      }
    })
  })

  /**
   * Handle button clicks
   */
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const clickedBtn = classifyButton(btn);
      const caretPosition = caretIndex(input);

      switch (clickedBtn.type) {
        // ----------------------------
        // Clear button (AC)
        // ----------------------------
        case "ac": {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleAC();
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
        }

        // ----------------------------
        // Delete button
        // ----------------------------
        case "delete": {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleDelete(
            input.textContent,
            caretPosition
          );
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
        }

        // ----------------------------
        // Angle mode buttons (deg/rad)
        // ----------------------------
        case "radian":
        case "degree": {
          console.log(clickedBtn.type, clickedBtn.value);
          setState(angleToggleContainer, 'angle');
          return;
        }

        // ----------------------------
        // Functions (sin, cos, tan, log, ln)
        // ----------------------------
        case "function": {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleFunctions(
            clickedBtn.value,
            input.textContent,
            caretPosition
          );
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
        }

        // ----------------------------
        // Equal button
        // ----------------------------
        case "equal": {
          console.log(clickedBtn.type, clickedBtn.value);
          const validated = validateForEvaluation(
            input.textContent,
            clickedBtn.value
          );

          if (validated.allowed) {
            const ModifiedInputText = changeMultiplySign();
            const { newInput, newCaret, showMsg } = handleEqual(
              ModifiedInputText
            );
            if (showMsg) showMessage();
            input.innerHTML = newInput;
            caretShowWithFocus(input, newCaret);
          }
          return;
        }

        // ----------------------------
        // Left Arrow
        // ----------------------------
        case "leftArrow": {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleLeftArrow(
            input.textContent,
            caretPosition
          );
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
        }

        // ----------------------------
        // Right Arrow
        // ----------------------------
        case "rightArrow": {
          console.log(clickedBtn.type, clickedBtn.value);
          const { newInput, newCaret, showMsg } = handleRightArrow(
            input.textContent,
            caretPosition
          );
          if (showMsg) showMessage();
          input.innerHTML = newInput;
          caretShowWithFocus(input, newCaret);
          return;
        }

        // ----------------------------
        // Default (numbers, operators, parentheses, etc.)
        // Validate before insert
        // ----------------------------
        default: {
          const validated = validateForDisplay(
            input.textContent,
            clickedBtn.value
          );

          // ------------------------
          // Universal insert logic
          // ------------------------
          if (validated.allowed) {
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
            const { newInput, newCaret } = replaceOperator(
              input.textContent,
              caretPosition,
              clickedBtn.value
            );
            input.innerHTML = newInput;
            caretShowWithFocus(input, newCaret);
            return;
          }

          // ----------------------------
          // Fallback for invalid input
          // ----------------------------
          showMessage(validated.message);
          caretShowWithFocus(input, caretPosition);
          return;
        }
      }
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
 * Set state ('deg' or 'rad'), ('dark' or 'light')
 * @param {string} value
 */

function setState(toggleContainer, statePropertyKey) {
  toggleContainer.addEventListener('click', (e) => {
    const clickedBtn = e.target.closest('[data-toggle="true"]');

    if (!clickedBtn) return;

    const clickedBtnValue = clickedBtn.dataset.value;

    state[statePropertyKey] = clickedBtnValue;
    console.log(state[statePropertyKey]);
    render();
  })
}

function renderToggle(toggleContainer, statePropertyValue) {
  const buttons = toggleContainer.querySelectorAll('.toggleBtn');

  buttons.forEach( btn => {
    btn.classList.toggle('active_toggle_btn', statePropertyValue === btn.dataset.value);
  })
}

function render() {
  renderToggle(angleToggleContainer, state.angle);
  renderToggle(themeToggleContainer, state.theme);
}

/**
 * Get current angle mode
 * @returns {string} 'deg' or 'rad'
 */
export function getMode(){
  // return DegRadMode;
  return state.angle;
}